import axios from './axios';

export const registerRequest = async (user) => {
    return axios.post('/auth/register', user);
};

export const loginRequest = async (user) => {
    return axios.post('/auth/login', user);
};

export const verifyTokenRequest = async () => {
    return axios.get('/auth/verify');
};

export const logoutRequest = async () => {
    return axios.get('/auth/logout');
};