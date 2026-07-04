import axios from 'axios';

export const createUserRequest = async (data) => {
  return await axios.post('/api/auth/register', data);
};