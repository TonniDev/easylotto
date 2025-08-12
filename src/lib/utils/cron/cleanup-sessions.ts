import { cleanupExpiredSessions } from '@lib/utils/auth';
import createLogger from '@lib/utils/logger';
import cron from 'node-cron';

const logger = createLogger({ filename: 'session-cleanup.log' });

export async function runSessionCleanup(): Promise<void> {
  try {
    logger.info('Starting session cleanup...');
    await cleanupExpiredSessions();
    logger.info('Session cleanup completed successfully');
  } catch (error) {
    logger.error('Session cleanup failed:', error);
    throw error;
  }
}

// Run cleanup every hour
export function startSessionCleanupCron(): void {
  cron.schedule('0 * * * *', async () => {
    try {
      await runSessionCleanup();
    } catch (error) {
      logger.error('Scheduled session cleanup failed:', error);
    }
  });
  
  logger.info('Session cleanup cron job started (runs every hour)');
}

// Manual execution
if (require.main === module) {
  runSessionCleanup()
    .then(() => {
      logger.info('Manual session cleanup completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Manual session cleanup failed:', error);
      process.exit(1);
    });
}
