import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).max(120).optional(),
    age: z.number().int().min(0).max(120).optional(),
    annualIncomeInr: z.number().min(0).optional(),
    occupation: z.string().min(1).max(120).optional(),
    category: z.enum(['General', 'OBC', 'SC', 'ST', 'EWS', 'Other']).optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    state: z.string().min(1).optional(),
    district: z.string().min(1).optional(),
    isDisabled: z.boolean().optional(),
    isBPL: z.boolean().optional(),
    address: z.string().min(1).max(500).optional(),
    aadhar: z
      .string()
      .regex(/^\d{12}$/, 'Aadhaar must be 12 digits')
      .optional(),
    notificationsEnabled: z.boolean().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});
