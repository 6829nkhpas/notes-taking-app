import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createNoteSchema, CreateNoteInput } from '../schemas';
import { useNotesStore } from '../useNotesStore';
import { useAuthStore } from '../../auth/useAuthStore';
import FormInput from '../../../components/FormInput';
import ErrorBanner from '../../../components/ErrorBanner';
import Loader from '../../../components/Loader';
import NoteCard from '../../../components/NoteCard';
import EmptyState from '../../../components/EmptyState';

export default function Notes() {
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuthStore();
  const { 
    notes, 
    loading, 
    error, 
    loadNotes, 
    createNote, 
    deleteNote,
    setError 
  } = useNotesStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateNoteInput>({
    resolver: zodResolver(createNoteSchema)
  });

  const title = watch('title');
  const body = watch('body');

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const onSubmit = async (data: CreateNoteInput) => {
    try {
      setIsCreating(true);
      await createNote(data);
      reset();
    } catch (error) {
      // Error is already set in the store
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
    } catch (error) {
      // Error is already set in the store
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-24 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Notes</h1>
          <p className="text-gray-600">
            Create, organize, and manage your thoughts
          </p>
        </div>

        {error && (
          <ErrorBanner 
            message={error} 
            onClose={() => setError(null)}
          />
        )}

        {/* Create Note Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Note</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              label="Title"
              name="title"
              placeholder="Enter note title"
              value={title || ''}
              onChange={(e) => register('title').onChange(e)}
              error={errors.title?.message}
              required
            />

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                Body (optional)
              </label>
              <textarea
                id="body"
                {...register('body')}
                placeholder="Enter note content..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              />
              {errors.body && (
                <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isCreating || !title?.trim()}
              className="form-button"
            >
              {isCreating ? (
                <div className="flex items-center justify-center">
                  <Loader size="sm" className="mr-2" />
                  Creating...
                </div>
              ) : (
                'Create Note'
              )}
            </button>
          </form>
        </div>

        {/* Notes List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Notes</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <Loader size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Loading your notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
