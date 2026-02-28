import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiTarget } from 'react-icons/fi';
import * as goalApi from '../api/goals';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';

const Goals: React.FC = () => {
    const [goals, setGoals] = useState<goalApi.Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTargetDate, setNewTargetDate] = useState('');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const data = await goalApi.getGoals();
            setGoals(data);
        } catch (error) {
            console.error('Failed to fetch goals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newTargetDate) return;

        try {
            const newGoal = await goalApi.createGoal({
                title: newTitle,
                targetDate: newTargetDate,
                progressPercentage: 0,
            });
            setGoals([newGoal, ...goals]);
            setNewTitle('');
            setNewTargetDate('');
            setIsAdding(false);
        } catch (error) {
            console.error('Failed to add goal:', error);
        }
    };

    const handleUpdateProgress = async (id: string, newProgress: number) => {
        try {
            const updatedGoal = await goalApi.updateGoal(id, { progressPercentage: newProgress });
            setGoals(goals.map((g) => (g._id === id ? updatedGoal : g)));
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    };

    const handleDeleteGoal = async (id: string) => {
        try {
            await goalApi.deleteGoal(id);
            setGoals(goals.filter((g) => g._id !== id));
        } catch (error) {
            console.error('Failed to delete goal:', error);
        }
    };

    if (isLoading) {
        return <LoadingSkeleton type="page" />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiTarget className="text-primary-500" /> Long-Term Goals
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Track your big milestones and stay focused.
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-primary flex items-center gap-2 self-start sm:self-auto"
                >
                    <FiPlus /> Add Goal
                </button>
            </div>

            {isAdding && (
                <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="card p-4 flex flex-col sm:flex-row gap-4 items-end"
                    onSubmit={handleAddGoal}
                >
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Goal Title
                        </label>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="input-field"
                            placeholder="E.g., Learn Spanish, Save $10k..."
                            required
                        />
                    </div>
                    <div className="sm:w-48 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Target Date
                        </label>
                        <input
                            type="date"
                            value={newTargetDate}
                            onChange={(e) => setNewTargetDate(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <button type="submit" className="btn-primary flex-1 sm:flex-none">
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="btn-secondary flex-1 sm:flex-none"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.form>
            )}

            {goals.length === 0 && !isAdding ? (
                <div className="text-center py-12 card bg-gray-50/50 dark:bg-gray-800/50 border-dashed border-2">
                    <FiTarget className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                        No goals yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Set a new goal to start tracking your progress.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {goals.map((goal) => (
                        <motion.div
                            layout
                            key={goal._id}
                            className="card overflow-hidden group"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="p-5 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                                            {goal.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteGoal(goal._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>

                                <div className="mt-auto pt-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            Progress
                                        </span>
                                        <span className="font-bold text-primary-600 dark:text-primary-400">
                                            {goal.progressPercentage}%
                                        </span>
                                    </div>

                                    {/* Progress Bar Container */}
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden flex shadow-inner">
                                        <motion.div
                                            className="bg-gradient-to-r from-primary-500 to-accent-500 h-3"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${goal.progressPercentage}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={goal.progressPercentage}
                                            onChange={(e) => handleUpdateProgress(goal._id, parseInt(e.target.value))}
                                            className="w-full accent-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default Goals;
