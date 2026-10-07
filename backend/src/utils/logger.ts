import winston from 'winston';
import { env } from '../config/env';

/**
 * Central application logger.
 * In production, plug this into a log aggregator (CloudWatch, Datadog, etc).
 * Never log decrypted PII — see encryption.service.ts for what counts as PII.
 */
export const logger = winston.createLogger({
  level: env.isProd ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.isProd ? winston.format.json() : winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
});
