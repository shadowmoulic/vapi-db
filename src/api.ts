import axios from 'axios';

const API_KEY = import.meta.env.VITE_VAPI_API_KEY;

const api = axios.create({
    baseURL: 'https://api.vapi.ai',
    headers: {
        Authorization: `Bearer ${API_KEY}`,
    },
});

export const getCalls = async () => {
    const response = await api.get('/call');
    return response.data;
};

export const getAssistants = async () => {
    const response = await api.get('/assistant');
    return response.data;
};

export const getAssistant = async (id: string) => {
    const response = await api.get(`/assistant/${id}`);
    return response.data;
};

export const updateAssistant = async (id: string, data: any) => {
    const response = await api.patch(`/assistant/${id}`, data);
    return response.data;
};
