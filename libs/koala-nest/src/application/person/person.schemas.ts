import { z } from 'zod';

export const personAddressSchema = (withId = false) =>
  z.object({
    ...(withId ? { id: z.number().positive() } : {}),
    address: z.string().min(1),
  });

export const personContactSchema = (withId = false) =>
  z.object({
    ...(withId ? { id: z.number().positive().optional() } : {}),
    contact: z.string().min(1),
  });
