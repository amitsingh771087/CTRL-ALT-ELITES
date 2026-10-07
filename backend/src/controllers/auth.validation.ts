import { z } from 'zod';

const phoneRegex = /^\+?[1-9]\d{9,14}$/; // E.164-ish, keeps it simple

export const startLoginSchema = z.object({
  body: z.object({
    phone: z.string().regex(phoneRegex, 'Enter a valid phone number, e.g. +919876543210'),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const completeLoginSchema = z.object({
  body: z.object({
    phone: z.string().regex(phoneRegex),
    code: z.string().length(6, 'OTP must be 6 digits'),
    fullName: z.string().min(1).max(120).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const refreshSchema = z.object({
  body: z.object({ refreshToken: z.string().min(10) }),
  params: z.object({}),
  query: z.object({}),
});
