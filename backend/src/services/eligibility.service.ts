import { Scheme, IScheme } from '../models/Scheme';
import { EligibilityProfileInput } from '../types';

/**
 * Eligibility Engine — matches a citizen's profile against active schemes.
 *
 * Mirrors the architecture diagram's "Eligibility Engine (AI / Rules)" box:
 * this is the deterministic rules layer. A ranking/ML re-ranker can be
 * layered on top later without changing this contract.
 */

export interface MatchedScheme {
  scheme: IScheme;
  matchScore: number; // 0-100, based on how many optional criteria also align
}

function ageInRange(profile: EligibilityProfileInput, rules: IScheme['rules']): boolean {
  if (rules.minAge !== undefined && profile.age < rules.minAge) return false;
  if (rules.maxAge !== undefined && profile.age > rules.maxAge) return false;
  return true;
}

function incomeWithinLimit(profile: EligibilityProfileInput, rules: IScheme['rules']): boolean {
  if (rules.maxAnnualIncomeInr === undefined) return true;
  return profile.annualIncomeInr <= rules.maxAnnualIncomeInr;
}

function categoryAllowed(profile: EligibilityProfileInput, rules: IScheme['rules']): boolean {
  if (!rules.allowedCategories?.length) return true;
  return rules.allowedCategories.includes(profile.category);
}

function genderAllowed(profile: EligibilityProfileInput, rules: IScheme['rules']): boolean {
  if (!rules.allowedGenders?.length) return true;
  return rules.allowedGenders.includes(profile.gender);
}

function occupationAllowed(profile: EligibilityProfileInput, rules: IScheme['rules']): boolean {
  if (!rules.allowedOccupations?.length) return true;
  return rules.allowedOccupations.some(
    (o) => o.toLowerCase() === profile.occupation.toLowerCase()
  );
}

function locationAllowed(profile: EligibilityProfileInput, rules: IScheme['rules']): boolean {
  const stateOk = !rules.states?.length || rules.states.includes(profile.state);
  const districtOk = !rules.districts?.length || rules.districts.includes(profile.district);
  return stateOk && districtOk;
}

function bplAndDisabilityOk(profile: EligibilityProfileInput, rules: IScheme['rules']): boolean {
  if (rules.requiresBPL && !profile.isBPL) return false;
  if (rules.requiresDisability && !profile.isDisabled) return false;
  return true;
}

/** Hard gate: every rule must pass for a scheme to be considered eligible at all. */
function isEligible(profile: EligibilityProfileInput, rules: IScheme['rules']): boolean {
  return (
    ageInRange(profile, rules) &&
    incomeWithinLimit(profile, rules) &&
    categoryAllowed(profile, rules) &&
    genderAllowed(profile, rules) &&
    occupationAllowed(profile, rules) &&
    locationAllowed(profile, rules) &&
    bplAndDisabilityOk(profile, rules)
  );
}

/** Soft score: rewards schemes that are more *specifically* targeted at this profile. */
function scoreSpecificity(rules: IScheme['rules']): number {
  let specificity = 0;
  const axes: Array<unknown> = [
    rules.minAge,
    rules.maxAge,
    rules.maxAnnualIncomeInr,
    rules.allowedCategories?.length,
    rules.allowedGenders?.length,
    rules.allowedOccupations?.length,
    rules.states?.length,
    rules.districts?.length,
    rules.requiresBPL,
    rules.requiresDisability,
  ];
  for (const a of axes) if (a) specificity += 1;
  return Math.min(100, Math.round((specificity / axes.length) * 100));
}

/**
 * Runs the profile against all active schemes and returns the eligible
 * subset, ranked by how targeted the scheme is (most specific matches first).
 */
export async function findEligibleSchemes(
  profile: EligibilityProfileInput
): Promise<MatchedScheme[]> {
  const activeSchemes = await Scheme.find({ isActive: true });

  const matches: MatchedScheme[] = [];
  for (const scheme of activeSchemes) {
    if (isEligible(profile, scheme.rules)) {
      matches.push({ scheme, matchScore: scoreSpecificity(scheme.rules) });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/** Checks a single scheme (used e.g. after a scheme sync, to notify newly-eligible users). */
export function matchesScheme(profile: EligibilityProfileInput, scheme: IScheme): boolean {
  return isEligible(profile, scheme.rules);
}
