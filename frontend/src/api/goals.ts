import api from './client';

export interface Goal {
    _id: string;
    title: string;
    targetDate: string;
    progressPercentage: number;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export const getGoals = async (): Promise<Goal[]> => {
    const response = await api.get('/goals');
    return response.data;
};

export const createGoal = async (data: { title: string; targetDate: string; progressPercentage?: number }): Promise<Goal> => {
    const response = await api.post('/goals', data);
    return response.data;
};

export const updateGoal = async (id: string, data: Partial<Goal>): Promise<Goal> => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
};

export const deleteGoal = async (id: string): Promise<{ id: string }> => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
};
