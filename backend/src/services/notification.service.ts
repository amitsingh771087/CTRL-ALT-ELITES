import { Notification } from '../models/Notification';
import { User, IUser } from '../models/User';
import { IScheme } from '../models/Scheme';
import { matchesScheme } from './eligibility.service';
import { EligibilityProfileInput } from '../types';
import { logger } from '../utils/logger';

/** Reconstructs the plain eligibility profile from an encrypted user doc. */
function toProfileInput(user: IUser): EligibilityProfileInput | null {
  const sensitive = user.getSensitiveProfile();
  if (
    sensitive.age === undefined ||
    sensitive.annualIncomeInr === undefined ||
    !user.occupation ||
    !user.category ||
    !user.gender ||
    !user.state ||
    !user.district
  ) {
    return null; // profile incomplete — skip
  }

  return {
    age: sensitive.age,
    annualIncomeInr: sensitive.annualIncomeInr,
    occupation: user.occupation,
    category: user.category,
    gender: user.gender,
    state: user.state,
    district: user.district,
    isDisabled: user.isDisabled,
    isBPL: user.isBPL,
  };
}

/**
 * "New matching scheme notification" from the flowchart.
 * Called after a scheme is created/updated (e.g. by the sync job) to
 * fan out a notification to every user who newly qualifies for it.
 */
export async function notifyEligibleUsersForScheme(scheme: IScheme): Promise<number> {
  const candidates = await User.find({
    isProfileComplete: true,
    notificationsEnabled: true,
    ...(scheme.rules.states?.length ? { state: { $in: scheme.rules.states } } : {}),
  }).select('+ageEncrypted +annualIncomeEncrypted');

  let notified = 0;
  for (const user of candidates) {
    const profile = toProfileInput(user);
    if (!profile || !matchesScheme(profile, scheme)) continue;

    await Notification.create({
      user: user._id,
      scheme: scheme._id,
      title: 'New scheme you may be eligible for',
      body: scheme.title,
    });
    notified += 1;
  }

  logger.info(`Notified ${notified} user(s) about scheme "${scheme.title}"`);
  return notified;
}
