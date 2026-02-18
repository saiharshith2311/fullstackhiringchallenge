import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';


export const createPost = async () => {
    const response = await axios.post(`${API_URL}/posts/`, {
        title: "Untitled",
        content_json: JSON.stringify({
            root: {
                children: [
                    {
                        children: [],
                        direction: null,
                        format: "",
                        indent: 0,
                        type: "paragraph",
                        version: 1
                    }
                ],
                direction: null,
                format: "",
                indent: 0,
                type: "root",
                version: 1
            }
        })
    });
    return response.data;
};

export const getPosts = async () => {
    const response = await axios.get(`${API_URL}/posts/`);
    return response.data;
};

export const getPost = async (id) => {
    const response = await axios.get(`${API_URL}/posts/${id}`);
    return response.data;
};

export const updatePost = async (id, data) => {
    const response = await axios.patch(`${API_URL}/posts/${id}`, data);
    return response.data;
};

export const publishPost = async (id) => {
    const response = await axios.post(`${API_URL}/posts/${id}/publish`);
    return response.data;
};

export const deletePost = async (id) => {
    await axios.delete(`${API_URL}/posts/${id}`);
};

export const generateAI = async (text, action) => {
    const response = await axios.post(`${API_URL}/ai/generate`, { text, action });
    return response.data;
};
