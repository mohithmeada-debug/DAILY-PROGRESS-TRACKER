import api from './client';

export type MoodValue = 'Happy' | 'Good' | 'Normal' | 'Low' | 'Stressed';

export interface Mood {
    _id: string;
    value: MoodValue;
    date: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export const getMoods = async (): Promise<Mood[]> => {
    const response = await api.get('/moods');
    return response.data;
};

export const getMoodByDate = async (date: string): Promise<Mood> => {
    const response = await api.get(`/moods/date/${date}`);
    return response.data;
};

export const setMood = async (data: { value: MoodValue; date: string }): Promise<Mood> => {
    const response = await api.post('/moods', data);
    return response.data;
};
