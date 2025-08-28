import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string()
    .min(1, 'Title required')
    .max(100, 'Max 100 chars'),
  body: z.string()
    .max(5000, 'Max 5000 chars')
    .optional()
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
