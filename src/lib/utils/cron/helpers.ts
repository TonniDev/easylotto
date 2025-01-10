import {Lotofacil} from "@lib/definitions/lotofacil";
import {LotteryRepository} from "@lib/domains/lottery/repository";
import {AxiosService} from "@lib/Network/AxiosService";
import {AxiosError} from "axios";
import {setTimeout as delay} from 'node:timers/promises';
import createLogger from "@lib/utils/logger";

const logger = createLogger({});

const RETRY_DELAY_MS = 2000;

const repository = new LotteryRepository(new AxiosService());

/**
 * Check the amount of items to run by either setting it from the param or by checking the
 * total amount of items in the API.
 *
 * @param {number} itemsToRun
 * @returns {Promise<number>}
 */
export async function getTotalItemsToRun(itemsToRun?: number): Promise<number> {
  if (itemsToRun) {
    return await new Promise(resolve => itemsToRun);
  }
  return await repository.getCurrentGameNumber();
}

/**
 * Decide whether an error should be retried.
 * For example, HTTP 5xx, 429, or certain network errors.
 *
 * @param {Error} err
 * @returns {boolean}
 */
export function isTransientError(err: AxiosError): boolean {
  if (err.response) {
    const status = err.response.status;
    return status >= 500 || status === 429;
  } else if (err.request) {
    return true;
  }
  return false;
}

/**
 * A helper that tries fetching an item multiple times in case of transient errors.
 * Returns item data if success, or throws an error after exhausting retries.
 *
 * @param {number} number
 * @param {number} retries
 * @returns {Promise<Lotofacil>} The item data from the API
 */
export async function fetchItemWithRetries(number: number, retries: number): Promise<Lotofacil> {
  let attempt = 1;
  let retryDelay = RETRY_DELAY_MS;
  let lastError = null;

  while (attempt <= retries) {
    try {
      return await repository.getItem({data: {number}});
    } catch (err: any) {
      if (isTransientError(err)) {
        logger.warn(
          `Transient error on item ${number} (attempt ${attempt}/${retries}): ${err.message}`
        );
        lastError = err;

        if (attempt < retries) {
          await delay(RETRY_DELAY_MS);
        }
      } else {
        logger.error(`Non-transient error on item ${number}: ${err.message}`);
        throw err;
      }
    }
    attempt++;
    retryDelay = retryDelay * 2;
  }
  throw lastError;
}
