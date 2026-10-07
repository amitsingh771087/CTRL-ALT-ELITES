import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Connects to MongoDB using Mongoose.
 * Retries are handled by the process manager (pm2 / k8s) on hard failure —
 * here we just fail loudly so the container/process restarts.
 */
export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  await mongoose.connect(env.mongoUri, {
    autoIndex: !env.isProd, // don't rebuild indexes on every boot in prod
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
