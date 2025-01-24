import {fetchItemWithRetries, getLastLotofacilLotteryGame} from "@lib/utils/cron/helpers";
import {createLotofacil, CreateLotofacilReturn} from "@lib/utils/db/lotofacil";
import * as Sentry from "@sentry/node";
import minimist from 'minimist';
import cron from 'node-cron';
import createLogger from "@lib/utils/logger";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
});

/**
 * Example usage:
 *   dotenv -f .env.local npx tsx src/lib/utils/cron/populate.ts --item=203 --throttle=2
 *
 * Flags:
 *   --item=N       => Start from item N (default = 1)
 *   --throttle=S   => Run job every S seconds (default = 1 second)
 *   --items=N      => Run only for the next N items (default = undefined).
 *   --retries=N    => Max amount of retries in case of transient failure. (default = 3)
 */
const args = minimist(process.argv.slice(2));
let currentId = args.item ? parseInt(args.item, 10) : 1;
const throttle = args.throttle ? parseInt(args.throttle, 10) : 1;
let itemsToRun = args.items ? args.items : undefined;
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

async function startCronJob() {
  try {
    const totalItems = await getLastLotofacilLotteryGame();
    logger.info(`Total items to process: ${totalItems}`);

    let isRunning = false;

    cron.schedule(cronExpression, async () => {
      if (isRunning) return;
      if (currentId > totalItems) {
        logger.info(`Successfully processed all ${totalItems} items. Congratulations!`);
        process.exit(0);
      }

      isRunning = true;
      try {
        const savedItem = await processItem(currentId);
        logger.info(`Item ${savedItem.gameNumber} inserted successfully with id ${savedItem.id}.`);
        currentId++;
      } catch (err: any) {
        logger.error(`
          Job stopped.
          Last successful item: ${currentId - 1}.
          Failed at item ${err.id}.
          Error: ${err.error}
        `);
        Sentry.captureException(err);
        process.exit(1);
      } finally {
        isRunning = false;
      }
    });

    logger.info(
      `Cron job started. Requesting every ${throttle} second(s), starting from item ${currentId}...`
    );
  } catch (error: any) {
    logger.error(`Failed to initialize the job. Error: ${error.message}`);
    Sentry.captureException(error);
    process.exit(1);
  }
}

// Start the job when the script is executed
void startCronJob();
