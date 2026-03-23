import axios from 'axios';

const DEFAULT_KEY = import.meta.env.VITE_VAPI_API_KEY;

const getApi = (key?: string) => {
    return axios.create({
        baseURL: 'https://api.vapi.ai',
        headers: {
            Authorization: `Bearer ${key || DEFAULT_KEY}`,
        },
    });
};

export const getCalls = async (key?: string) => {
    const response = await getApi(key).get('/call');
    return response.data;
};

export const getAssistants = async (key?: string) => {
    const response = await getApi(key).get('/assistant');
    return response.data;
};

export const getAssistant = async (id: string, key?: string) => {
    const response = await getApi(key).get(`/assistant/${id}`);
    return response.data;
};

export const updateAssistant = async (id: string, data: any, key?: string) => {
    const response = await getApi(key).patch(`/assistant/${id}`, data);
    return response.data;
};
