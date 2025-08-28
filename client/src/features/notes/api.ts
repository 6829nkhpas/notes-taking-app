import { api } from '../../app/axios';
import { CreateNoteInput } from './schemas';

export const listNotes = () => 
  api.get('/notes');

export const createNote = (payload: CreateNoteInput) => 
  api.post('/notes', payload);

export const deleteNote = (id: string) => 
  api.delete(`/notes/${id}`);
