import { Request, Response, NextFunction } from 'express';
import { createNoteSchema, deleteNoteSchema } from './notes.schemas';
import Note from './note.model';
import { ok, created, noContent } from '../../core/http';
import { createApiError } from '../../core/errors';

export class NotesController {
  static async listNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const notes = await Note.find({ userId: req.user!.id })
        .sort({ createdAt: -1 })
        .select('-__v');
      
      return ok(res, { notes });
    } catch (error) {
      next(error);
    }
  }

  static async createNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, body } = createNoteSchema.parse(req.body);
      
      const note = await Note.create({
        userId: req.user!.id,
        title: title.trim(),
        body: body?.trim() || ''
      });
      
      return created(res, {
        note: {
          id: note._id,
          title: note.title,
          body: note.body,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = deleteNoteSchema.parse(req.params);
      
      const result = await Note.deleteOne({ 
        _id: id, 
        userId: req.user!.id 
      });
      
      if (result.deletedCount === 0) {
        throw createApiError('Note not found', 404, 'NOTE_NOT_FOUND');
      }
      
      return noContent(res);
    } catch (error) {
      next(error);
    }
  }
}
