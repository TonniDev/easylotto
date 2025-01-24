import {Lotofacil} from "@lib/definitions/lotofacil";
import {LotteryRepository} from "@lib/domains/lottery/repository";
import {AxiosService} from "@lib/Network/AxiosService";
import {upsertStatistic} from "@lib/utils/db/lotofacil";
import {isEven, isFibonacci, isMultipleOf3, isOdd, isPrime} from "@lib/utils/math/baseOperations";
import {countNumbersByCondition} from "@lib/utils/math/numberGenerator";
import {AxiosError} from "axios";
import {setTimeout as delay} from 'node:timers/promises';
import createLogger from "@lib/utils/logger";

const logger = createLogger({});

const RETRY_DELAY_MS = 2000;

const repository = new LotteryRepository(new AxiosService());

/**
 * Get the latest lottery game number entry from external public API for the lotofacil lottery game
 *
 * @returns {Promise<number>}
 */
export async function getLastLotofacilLotteryGame(): Promise<number> {
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

export function generateKeyByAttributesCount(list: (number | string)[]): string[] {
  const ob = {
    fibonacci: countNumbersByCondition(list, isFibonacci),
    prime: countNumbersByCondition(list, isPrime),
    multiplesOf3: countNumbersByCondition(list, isMultipleOf3),
    odd: countNumbersByCondition(list, isOdd),
    even: countNumbersByCondition(list, isEven),
  };
  return [
    `fibonacci_${ob.fibonacci}`,
    `prime_${ob.prime}`,
    `multiplesOf3_${ob.multiplesOf3}`,
    `odd_${ob.odd}`,
    `even_${ob.even}`,
    `fr${ob.fibonacci}_pr${ob.prime}_mr${ob.multiplesOf3}_or${ob.odd}_er${ob.even}`,
  ];
}

export async function upsertStatistics(lotteryNumbers: string[], gameNumber: number) {
  try {
    const statistics = generateKeyByAttributesCount(lotteryNumbers);
    let savedStats = [];
    for (const key of statistics) {
      logger.info(`Processing statistic ${key}...`);
      const savedStat = await upsertStatistic(key, gameNumber);
      logger.info(`
            Statistic saved for game ${gameNumber} with ${savedStat.value} occurrences.
          `);
      savedStats.push({
        combinationKey: key,
        occurrences: savedStat.value,
      });
    }
    return savedStats;
  } catch (e) {
    throw e;
  }
}
