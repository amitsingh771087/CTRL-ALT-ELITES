import { Scheme } from '../models/Scheme';
import { SchemeSourceAuthority } from '../types';
import { notifyEligibleUsersForScheme } from './notification.service';
import { logger } from '../utils/logger';

/**
 * Scheduled Scheme Sync Service — matches the "Scheme Sync Service" /
 * "Government scheme data sources" boxes in the architecture diagram
 * (MBMC, BMC, Maharashtra Govt, India Govt portals).
 *
 * Each portal has different data shapes; a per-source adapter normalises
 * its payload into our ISchemeRules format before upserting. These are
 * stubs — wire in the real portal APIs/scrapers where marked TODO.
 */

interface RawSchemePayload {
  externalId: string;
  title: string;
  description: string;
  benefits: string;
  requiredDocuments: string[];
  applySteps: string[];
  sourceUrl?: string;
  rules: Record<string, unknown>;
}

async function fetchFromSource(source: SchemeSourceAuthority): Promise<RawSchemePayload[]> {
  // TODO: replace with real integration per source (REST API / scraper / file feed).
  logger.debug(`(stub) Fetching schemes from ${source} — wire up the real adapter here`);
  return [];
}

function levelForSource(source: SchemeSourceAuthority): 'Local' | 'State' | 'Central' {
  if (source === 'MBMC' || source === 'BMC') return 'Local';
  if (source === 'Maharashtra Govt') return 'State';
  return 'Central';
}

async function syncSource(source: SchemeSourceAuthority): Promise<void> {
  const rawSchemes = await fetchFromSource(source);

  for (const raw of rawSchemes) {
    const scheme = await Scheme.findOneAndUpdate(
      { sourceAuthority: source, externalId: raw.externalId },
      {
        $set: {
          title: raw.title,
          description: raw.description,
          benefits: raw.benefits,
          requiredDocuments: raw.requiredDocuments,
          applySteps: raw.applySteps,
          sourceUrl: raw.sourceUrl,
          level: levelForSource(source),
          rules: raw.rules,
          isActive: true,
          lastSyncedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    await notifyEligibleUsersForScheme(scheme);
  }
}

/** Runs a full sync across every government portal in the diagram. */
export async function runSchemeSync(): Promise<void> {
  const sources: SchemeSourceAuthority[] = ['MBMC', 'BMC', 'Maharashtra Govt', 'India Govt'];
  logger.info('Starting scheduled scheme sync...');

  for (const source of sources) {
    try {
      await syncSource(source);
    } catch (err) {
      logger.error(`Scheme sync failed for ${source}: ${(err as Error).message}`);
    }
  }

  logger.info('Scheme sync complete.');
}
