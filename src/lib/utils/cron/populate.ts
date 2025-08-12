import {prisma} from "@lib/prisma";
import {fetchItemWithRetries, getLastLotofacilLotteryGame} from "@lib/utils/cron/helpers";
import {createLotofacil, CreateLotofacilReturn} from "@lib/utils/db/lotofacil";
import createLogger from "@lib/utils/logger";
import * as Sentry from "@sentry/node";
import minimist from 'minimist';
import cron from 'node-cron';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
});

/**
 * Example usage:
 *   dotenv -e .env.local npx tsx src/lib/utils/cron/populate.ts --item=203 --throttle=2
 *
 * Flags:
 *   --item=N       => Start from item N (default = 1)
 *   --throttle=S   => Run job every S seconds (default = 1 second)
 *   --items=N      => Run only for the next N items (default = undefined).
 *   --retries=N    => Max amount of retries in case of transient failure. (default = 3)
 */
const args = minimist(process.argv.slice(2));
const startFromItem = args.item ? parseInt(args.item, 10) : 1;
const throttle = args.throttle ? parseInt(args.throttle, 10) : 1;
const itemsToRun = args.items ? parseInt(args.items, 10) : undefined;
const retries = args.retries ? args.retries : 3;
const cronExpression = throttle === 1 ? '* * * * * *' : `*/${throttle} * * * * *`;

const logger = createLogger({});

/**
 * Process a single item requesting from external API and saving to local DB.
 * Returns a message if success, or throws an error after exhausting retries.
 *
 * @param {number} number
 * @returns {Promise<CreateLotofacilReturn>} An object with id, gameNumber and error.
 */
async function processItem(number: number): Promise<CreateLotofacilReturn> {
    const itemData = await fetchItemWithRetries(number, retries);
    return await createLotofacil(itemData);
}

async function handler(): Promise<void> {
  const lastLotteryGame = await getLastLotofacilLotteryGame();

  // Check if we should start from existing data or from scratch
  const lastItemSaved = await prisma.loterias.findFirst({
    orderBy: {
      created: 'desc',
    },
  });

  let currentId: number;
  let totalItems: number;

  if (lastItemSaved?.numero && !startFromItem) {
    // If we have existing data and no specific start item, continue from where we left off
    logger.info(`Found existing data. Last item saved: ${lastItemSaved.numero}. Continuing from there.`);
    currentId = lastItemSaved.numero;
    const missingGames = lastLotteryGame - lastItemSaved.numero;
    totalItems = itemsToRun ? Math.min(itemsToRun, missingGames) : missingGames;
  } else {
    // Start from specified item or from 1 if no data exists
    currentId = startFromItem;
    const remainingItems = lastLotteryGame - currentId + 1;
    totalItems = itemsToRun ? Math.min(itemsToRun, remainingItems) : remainingItems;
    logger.info(`Starting from item ${currentId}. ${lastItemSaved?.numero ? 'Overriding existing data.' : 'No existing data found.'}`);
  }

  if (totalItems <= 0) {
    logger.info(`No items to process. Last item saved: ${lastItemSaved?.numero ?? 'none'}. Last game: ${lastLotteryGame}.`);
    process.exit(0);
  }

  logger.info(`Total items to process: ${totalItems}. Starting from item ${currentId}. Last game: ${lastLotteryGame}.`);

  const lastItemToProcess = currentId + totalItems;
  let isRunning = false;

  cron.schedule(cronExpression, async () => {
    if (isRunning) return;

    currentId++;

    if (currentId > lastItemToProcess) {
      logger.info(`Successfully processed all ${totalItems} items. Congratulations!`);
      process.exit(0);
    }

    isRunning = true;
    logger.info(`Processing item ${currentId}...`);
    try {
      const savedItem = await processItem(currentId);
      logger.info(`Item ${savedItem.gameNumber} inserted successfully with id ${savedItem.id}.`);
    } catch (err: unknown) {
      const error = err as { id?: number; error?: string };
      logger.error(`
        Job stopped.
        Last successful item: ${currentId - 1}.
        Failed at item ${error.id || 'unknown'}.
        Error: ${error.error || 'unknown error'}
      `);
      Sentry.captureException(error);
      process.exit(1);
    } finally {
      isRunning = false;
    }
  });

  logger.info(
    `Cron job started. Requesting every ${throttle} second(s), starting from item ${currentId}...`
  );
}

async function startCronJob() {
  try {
    await handler();
  } catch (err: unknown) {
    const error = err as Error;
    logger.error(`Failed to initialize the job. Error: ${error.message || 'unknown error'}`);
    Sentry.captureException(error);
    process.exit(1);
  }
}

// Start the job when the script is executed
void startCronJob();
