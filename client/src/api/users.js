import axios from './axios';  // ← USAR LA INSTANCIA CONFIGURADA

export const createUserRequest = async (data) => {
  return await axios.post('/auth/create-recepcion', data);
};