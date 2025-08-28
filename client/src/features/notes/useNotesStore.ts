import { create } from 'zustand';
import { listNotes, createNote, deleteNote } from './api';
import { CreateNoteInput } from './schemas';

export interface Note {
  id: string;
  title: string;
  body?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesState {
  notes: Note[];
  loading: boolean;
  error: string | null;
}

interface NotesActions {
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadNotes: () => Promise<void>;
  createNote: (payload: CreateNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

type NotesStore = NotesState & NotesActions;

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  loading: false,
  error: null,

  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  removeNote: (id) => set((state) => ({ 
    notes: state.notes.filter(note => note.id !== id) 
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  loadNotes: async () => {
    try {
      set({ loading: true, error: null });
      const response = await listNotes();
      set({ notes: response.data.data.notes, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to load notes', 
        loading: false 
      });
    }
  },

  createNote: async (payload) => {
    try {
      set({ loading: true, error: null });
      const response = await createNote(payload);
      const newNote = response.data.data.note;
      set((state) => ({ 
        notes: [newNote, ...state.notes], 
        loading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create note', 
        loading: false 
      });
      throw error;
    }
  },

  deleteNote: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteNote(id);
      set((state) => ({ 
        notes: state.notes.filter(note => note.id !== id), 
        loading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete note', 
        loading: false 
      });
      throw error;
    }
  }
}));
