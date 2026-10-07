import cron from 'node-cron';
import { env } from '../config/env';
import { runSchemeSync } from '../services/schemeSync.service';
import { logger } from '../utils/logger';

/**
 * Registers the scheduled job that keeps the Scheme Database in sync
 * with MBMC / BMC / Maharashtra Govt / India Govt sources, per the
 * architecture diagram's "Scheduled Scheme Sync Service".
 */
export function scheduleSchemeSyncJob(): void {
  if (!cron.validate(env.schemeSyncCron)) {
    logger.warn(`Invalid SCHEME_SYNC_CRON "${env.schemeSyncCron}" — job not scheduled`);
    return;
  }

  cron.schedule(env.schemeSyncCron, () => {
    runSchemeSync().catch((err) => logger.error(`Scheme sync job crashed: ${err}`));
  });

  logger.info(`Scheme sync job scheduled (cron: "${env.schemeSyncCron}")`);
}
