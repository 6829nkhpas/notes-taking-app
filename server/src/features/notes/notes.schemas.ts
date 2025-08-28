import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less')
    .trim(),
  body: z.string()
    .max(5000, 'Note body must be 5000 characters or less')
    .trim()
    .optional()
});

export const deleteNoteSchema = z.object({ 
  id: z.string().length(24, 'Invalid note ID') 
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type DeleteNoteInput = z.infer<typeof deleteNoteSchema>;
