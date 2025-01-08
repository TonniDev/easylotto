// src/utils/cron/populate.js
import {fetchItemWithRetries, getTotalItemsToRun} from "@lib/utils/cron/helpers";
import {createLotofacil} from "@lib/utils/db/lotofacil";
import minimist from 'minimist';
import cron from 'node-cron';

/**
 * Example usage:
 *   node src/utils/cron/populate.js --item=203 --throttle=2
 *
 * Flags:
 *   --item=N       => Start from item N (default = 1)
 *   --throttle=S   => Run job every S seconds (default = 1 second)
 *   --items=N      => Run for the next N items (default = undefined). If undefined then run for all the items.
 *   --retries=N    => Max amount of retries in case of transient failure. (default = 3)
 */
const args = minimist(process.argv.slice(2));
let currentId = args.item ? parseInt(args.item, 10) : 1;
const throttle = args.throttle ? parseInt(args.throttle, 10) : 1;
let itemsToRun = args.items ? args.items : undefined;
const retries = args.retries ? args.retries : 3;
const cronExpression = throttle === 1 ? '* * * * * *' : `*/${throttle} * * * * *`;

/**
 * Process a single item requesting from external API and saving to local DB.
 * Returns a message if success, or throws an error after exhausting retries.
 *
 * @param {number} number
 * @returns {Promise<string>} A success message.
 */
async function processItem(number: number): Promise<string> {
    const itemData = await fetchItemWithRetries(number, retries);
    return await createLotofacil(itemData);
}

async function startCronJob() {
  try {
    const totalItems = await getTotalItemsToRun(itemsToRun);
    console.log(`Total items to process: ${totalItems}`);

    cron.schedule(cronExpression, async () => {
      if (currentId > totalItems) {
        console.log(`Successfully processed all ${totalItems} items. Congratulations!`);
        process.exit(0);
      }

      try {
        const message = await processItem(currentId);
        console.log(message);
        currentId++;
      } catch (err: any) {
        console.error(`
          Job stopped. 
          Last successful item: ${currentId - 1}. 
          Failed at item ${err.id}. 
          Error: ${err.error}
        `);
        process.exit(1);
      }
    });

    console.log(
      `Cron job started. Requesting every ${throttle} second(s), starting from item ${currentId}...`
    );
  } catch (error: any) {
    console.error(`Failed to initialize the job. Error: ${error.message}`);
    process.exit(1);
  }
}

// Start the job when the script is executed
void startCronJob();
