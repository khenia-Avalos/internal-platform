import axios from 'axios';

const API_URL = 'https://el-exito-internal-platform.onrender.com';

// 🔥 CONFIGURACIÓN PARA ENVIAR COOKIES
axios.defaults.withCredentials = true;

export const getHistorialByCitaRequest = async (citaId) => {
  return await axios.get(`${API_URL}/api/historial/cita/${citaId}`, { withCredentials: true });
};

export const createHistorialRequest = async (data) => {
  return await axios.post(`${API_URL}/api/historial`, data, { withCredentials: true });
};

export const updateHistorialRequest = async (id, data) => {
  return await axios.put(`${API_URL}/api/historial/${id}`, data, { withCredentials: true });
};

export const deleteHistorialRequest = async (id) => {
  return await axios.delete(`${API_URL}/api/historial/${id}`, { withCredentials: true });
};