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
 *   dotenv -f .env.local npx tsx src/lib/utils/cron/update.ts --item=203 --throttle=2
 *
 * Flags:
 *   --throttle=S   => Run job every S seconds (default = 1 second)
 *   --items=N      => Run only for the next N items (default = undefined).
 *   --retries=N    => Max amount of retries in case of transient failure. (default = 3)
 */
const args = minimist(process.argv.slice(2));
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

  const lastItemSaved = await prisma.loterias.findFirst({
    orderBy: {
      created: 'desc',
    },
  });

  if (!lastItemSaved?.numero) {
    logger.warn('No items saved yet. You need to populate the database first.');
    process.exit(0);
  }
  
  const missingGames = lastLotteryGame - (lastItemSaved?.numero ?? 0);

  const totalItems = (() => {
    if (!itemsToRun) return missingGames;
    if (itemsToRun > missingGames) return itemsToRun;
    return missingGames;
  })();

  if (totalItems > 0) {
    logger.info(`Total items to process: ${totalItems}. Last item saved: ${lastItemSaved?.numero ?? 0}. Last game: ${lastLotteryGame}.`);

    let currentId = lastItemSaved.numero;
    const lastItemToProcess = currentId + totalItems;
    let isRunning = false;

    cron.schedule(cronExpression, async () => {
      if (isRunning) return;

      currentId++;

      if (currentId > lastItemToProcess) {
        logger.info(`Successfully processed all ${totalItems} items. Congratulations! (Starting from: ${currentId})`);
        process.exit(0);
      }

      isRunning = true;
      logger.info(`Processing item ${currentId}...`);
      try {

        const savedItem = await processItem(currentId);

        logger.info(
          `Item ${savedItem.gameNumber} inserted successfully with id ${savedItem.id}.`
        );

      } catch (error: any) {
        logger.error(`
            Job stopped.
            Last successful item: ${currentId - 1}.
            Failed at item ${error.id}.
            Error: ${error.error}
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
  } else {
    logger.info(`No items to process. Last item saved: ${lastItemSaved?.numero ?? 0}. Last game: ${lastLotteryGame}.`);
    process.exit(0);
  }
}

async function startCronJob() {
  try {
    await handler();
  } catch (error: any) {
    logger.error(`Failed to initialize the job. Error: ${error.message}`);
    Sentry.captureException(error);
    process.exit(1);
  }
}

// Start the job when the script is executed
void startCronJob();
