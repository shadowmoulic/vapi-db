import axios from 'axios';

// IMPORTANT: No global fallback here. We must provide a key from the Auth profile.
const getApi = (key: string | null) => {
    if (!key) {
        throw new Error('Unauthorized: No Vapi API Key provided for this client.');
    }
    return axios.create({
        baseURL: 'https://api.vapi.ai',
        headers: {
            Authorization: `Bearer ${key}`,
        },
    });
};

export const getCalls = async (key: string | null) => {
    try {
        const response = await getApi(key).get('/call');
        return response.data;
    } catch {
        return []; // Return empty dataset if no unauthorized/no key
    }
};

export const getAssistants = async (key: string | null) => {
    try {
        const response = await getApi(key).get('/assistant');
        return response.data;
    } catch {
        return [];
    }
};

export const getAssistant = async (id: string, key: string | null) => {
    const response = await getApi(key).get(`/assistant/${id}`);
    return response.data;
};

export const updateAssistant = async (id: string, data: any, key: string | null) => {
    const response = await getApi(key).patch(`/assistant/${id}`, data);
    return response.data;
};
