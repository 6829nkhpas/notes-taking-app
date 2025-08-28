import React from 'react';
import { Note } from '../features/notes/useNotesStore';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, onDelete }: NoteCardProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
          {note.title}
        </h3>
        <button
          onClick={handleDelete}
          className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete note"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {note.body && (
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {note.body}
        </p>
      )}
      
      <div className="text-xs text-gray-400">
        {new Date(note.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
