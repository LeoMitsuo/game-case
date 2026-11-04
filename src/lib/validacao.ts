import { z } from 'zod';

export const schemaItem = z.object({
  status: z.enum(['playing', 'finished', 'backlog', 'dropped']),
  platform: z.string().max(60).nullable(),
  rating: z
    .number()
    .int()
    .min(1, 'A nota vai de 1 a 10.')
    .max(10, 'A nota vai de 1 a 10.')
    .nullable(),
  notes: z.string().max(500, 'Máximo de 500 caracteres.').nullable(),
});

export type DadosItem = z.infer<typeof schemaItem>;