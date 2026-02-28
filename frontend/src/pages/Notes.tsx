import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiSave, FiPlus, FiBookOpen } from 'react-icons/fi';
import * as noteApi from '../api/notes';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';

const Notes: React.FC = () => {
    const [notes, setNotes] = useState<noteApi.Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const [editMode, setEditMode] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');

    useEffect(() => {
        fetchNotes();
    }, [currentDate]);

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            const data = await noteApi.getNoteByDate(currentDate);
            setNotes(data);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNote = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newNoteContent.trim()) return;

        try {
            const note = await noteApi.createNote({
                content: newNoteContent,
                date: currentDate,
            });
            setNotes([note, ...notes]);
            setNewNoteContent('');
            setIsAddingNew(false);
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    };

    const handleUpdateNote = async (id: string) => {
        if (!editContent.trim()) return;
        try {
            const updatedNote = await noteApi.updateNote(id, { content: editContent });
            setNotes(notes.map((n) => (n._id === id ? updatedNote : n)));
            setEditMode(null);
        } catch (error) {
            console.error('Failed to update note:', error);
        }
    };

    const handleDeleteNote = async (id: string) => {
        try {
            await noteApi.deleteNote(id);
            setNotes(notes.filter((n) => n._id !== id));
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    const startEdit = (note: noteApi.Note) => {
        setEditMode(note._id);
        setEditContent(note.content);
    };

   if (isLoading && notes.length === 0) {
    return <div className="text-center py-10">Loading...</div>;
}

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 max-w-4xl mx-auto"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiBookOpen className="text-primary-500" /> Daily Notes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Capture your thoughts, reflections, and ideas.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={currentDate}
                        onChange={(e) => setCurrentDate(e.target.value)}
                        className="input-field py-2"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Notes for {new Date(currentDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </h2>
                {!isAddingNew && (
                    <button
                        onClick={() => setIsAddingNew(true)}
                        className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1"
                    >
                        <FiPlus /> New Note
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isAddingNew && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="card p-0 overflow-hidden border-2 border-primary-200 dark:border-primary-900"
                    >
                        <textarea
                            autoFocus
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            placeholder="What's on your mind today?"
                            className="w-full p-4 bg-transparent border-0 focus:ring-0 resize-none min-h-[120px] text-gray-800 dark:text-gray-200 outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    handleCreateNote();
                                }
                            }}
                        />
                        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                            <span className="text-xs text-gray-500">Press Ctrl+Enter to save</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsAddingNew(false)}
                                    className="btn-secondary py-1 px-3 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateNote}
                                    disabled={!newNoteContent.trim()}
                                    className="btn-primary py-1 px-4 text-sm"
                                >
                                    Save Note
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {notes.length === 0 && !isLoading && !isAddingNew ? (
                <div className="text-center py-16 card bg-gray-50/50 dark:bg-gray-800/50 border-dashed border-2">
                    <FiBookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-base font-medium text-gray-900 dark:text-white">
                        No notes for this day
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Get started by creating a new note.
                    </p>
                    <button
                        onClick={() => setIsAddingNew(true)}
                        className="btn-primary inline-flex items-center gap-2"
                    >
                        <FiPlus /> Create Note
                    </button>
                </div>
            ) : (
                <div className="space-y-4 relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10 backdrop-blur-sm rounded-xl">
                            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    <AnimatePresence>
                        {notes.map((note) => (
                            <motion.div
                                key={note._id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                className="card overflow-hidden group"
                            >
                                {editMode === note._id ? (
                                    <div>
                                        <textarea
                                            autoFocus
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full p-4 bg-gray-50 dark:bg-gray-800/80 border-0 focus:ring-0 resize-y min-h-[120px] text-gray-800 dark:text-gray-200 outline-none"
                                        />
                                        <div className="px-4 py-3 flex justify-end items-center gap-2 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                                            <button
                                                onClick={() => setEditMode(null)}
                                                className="btn-secondary py-1 px-3 text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleUpdateNote(note._id)}
                                                className="btn-primary py-1 px-4 text-sm flex items-center gap-1"
                                            >
                                                <FiSave /> Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 flex flex-col sm:flex-row gap-4">
                                        <div className="flex-1 whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                                            {note.content}
                                        </div>
                                        <div className="flex sm:flex-col items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity justify-end sm:justify-start">
                                            <button
                                                onClick={() => startEdit(note)}
                                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                title="Edit note"
                                            >
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note._id)}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Delete note"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="px-5 py-2 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">
                                    {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default Notes;
