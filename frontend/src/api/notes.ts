import api from './client';

export interface Note {
    _id: string;
    content: string;
    date: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export const getNotes = async (): Promise<Note[]> => {
    const response = await api.get('/notes');
    return response.data;
};

export const getNoteByDate = async (date: string): Promise<Note[]> => {
    const response = await api.get(`/notes/date/${date}`);
    return response.data;
};

export const createNote = async (data: { content: string; date: string }): Promise<Note> => {
    const response = await api.post('/notes', data);
    return response.data;
};

export const updateNote = async (id: string, data: Partial<Note>): Promise<Note> => {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
};

export const deleteNote = async (id: string): Promise<{ id: string }> => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
};
