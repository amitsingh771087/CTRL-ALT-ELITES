import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { Scheme } from '../models/Scheme';
import { User } from '../models/User';
import { findEligibleSchemes } from '../services/eligibility.service';
import { ApiError } from '../utils/ApiError';

/**
 * GET /schemes
 * "Browse all government schemes — no login required" from the flowchart.
 * Public endpoint: no auth middleware applied on this route.
 */
export const browseSchemes = catchAsync(async (req: Request, res: Response) => {
  const { level, state, page = '1', limit = '20' } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = { isActive: true };
  if (level) filter.level = level;
  if (state) filter['rules.states'] = { $in: [state] };

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  const [schemes, total] = await Promise.all([
    Scheme.find(filter)
      .select('-rules') // keep rules internal; the public listing doesn't need them
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Scheme.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    page: pageNum,
    limit: limitNum,
    total,
    schemes,
  });
});

/** GET /schemes/:id — scheme detail, including required documents & apply steps. */
export const getSchemeById = catchAsync(async (req: Request, res: Response) => {
  const scheme = await Scheme.findOne({ _id: req.params.id, isActive: true }).select('-rules');
  if (!scheme) throw ApiError.notFound('Scheme not found');
  res.status(200).json({ success: true, scheme });
});

/**
 * GET /schemes/eligible
 * "Personalized eligible schemes — Local / State / Central" from the
 * flowchart. Requires auth + a completed profile.
 */
export const getMyEligibleSchemes = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId).select(
    '+ageEncrypted +annualIncomeEncrypted +addressEncrypted +aadharEncrypted'
  );
  if (!user) throw ApiError.notFound('User not found');
  if (!user.isProfileComplete) {
    throw ApiError.badRequest('Complete your eligibility profile first');
  }

  const sensitive = user.getSensitiveProfile();
  const matches = await findEligibleSchemes({
    age: sensitive.age!,
    annualIncomeInr: sensitive.annualIncomeInr!,
    occupation: user.occupation!,
    category: user.category!,
    gender: user.gender!,
    state: user.state!,
    district: user.district!,
    isDisabled: user.isDisabled,
    isBPL: user.isBPL,
  });

  res.status(200).json({
    success: true,
    count: matches.length,
    schemes: matches.map((m) => ({
      id: m.scheme._id,
      title: m.scheme.title,
      level: m.scheme.level,
      sourceAuthority: m.scheme.sourceAuthority,
      benefits: m.scheme.benefits,
      matchScore: m.matchScore,
    })),
  });
});
