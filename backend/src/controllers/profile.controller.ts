import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';

const REQUIRED_FOR_COMPLETE = [
  'age',
  'annualIncomeInr',
  'occupation',
  'category',
  'gender',
  'state',
  'district',
] as const;

/**
 * GET /profile
 * Returns the caller's own profile, decrypting sensitive fields —
 * a user may only ever read their own decrypted data.
 */
export const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId).select(
    '+phoneEncrypted +ageEncrypted +annualIncomeEncrypted +addressEncrypted +aadharEncrypted'
  );
  if (!user) throw ApiError.notFound('User not found');

  const sensitive = user.getSensitiveProfile();

  res.status(200).json({
    success: true,
    profile: {
      id: user._id,
      fullName: user.fullName,
      phone: user.getPhone(),
      age: sensitive.age,
      annualIncomeInr: sensitive.annualIncomeInr,
      address: sensitive.address,
      aadhar: sensitive.aadhar ? `XXXX-XXXX-${sensitive.aadhar.slice(-4)}` : undefined, // masked
      occupation: user.occupation,
      category: user.category,
      gender: user.gender,
      state: user.state,
      district: user.district,
      isDisabled: user.isDisabled,
      isBPL: user.isBPL,
      isProfileComplete: user.isProfileComplete,
      notificationsEnabled: user.notificationsEnabled,
    },
  });
});

/**
 * PATCH /profile
 * "Fill eligibility profile" / "Update profile anytime" steps.
 * Sensitive fields (age, income, address, aadhar) are re-encrypted on write.
 */
export const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) throw ApiError.notFound('User not found');

  const {
    fullName,
    age,
    annualIncomeInr,
    occupation,
    category,
    gender,
    state,
    district,
    isDisabled,
    isBPL,
    address,
    aadhar,
    notificationsEnabled,
  } = req.body;

  if (fullName !== undefined) user.fullName = fullName;
  if (occupation !== undefined) user.occupation = occupation;
  if (category !== undefined) user.category = category;
  if (gender !== undefined) user.gender = gender;
  if (state !== undefined) user.state = state;
  if (district !== undefined) user.district = district;
  if (isDisabled !== undefined) user.isDisabled = isDisabled;
  if (isBPL !== undefined) user.isBPL = isBPL;
  if (notificationsEnabled !== undefined) user.notificationsEnabled = notificationsEnabled;

  user.setSensitiveProfile({ age, annualIncomeInr, address, aadhar });

  const merged = { ...user.toObject(), age, annualIncomeInr, address, aadhar };
  user.isProfileComplete = REQUIRED_FOR_COMPLETE.every(
    (key) => merged[key as keyof typeof merged] !== undefined
  );

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated',
    isProfileComplete: user.isProfileComplete,
  });
});
