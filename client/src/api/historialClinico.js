import axios from 'axios';

// 🔥 URL COMPLETA DEL BACKEND
const API_URL = 'https://el-exito-internal-platform.onrender.com';

// Obtener historial por cita
export const getHistorialByCitaRequest = async (citaId) => {
  console.log('🔍 GET a:', `${API_URL}/api/historial/cita/${citaId}`);
  return await axios.get(`${API_URL}/api/historial/cita/${citaId}`);
};

// Crear historial
export const createHistorialRequest = async (data) => {
  console.log('🔥 POST a:', `${API_URL}/api/historial`);
  console.log('📝 Datos:', data);
  return await axios.post(`${API_URL}/api/historial`, data);
};

// Actualizar historial
export const updateHistorialRequest = async (id, data) => {
  console.log('🔥 PUT a:', `${API_URL}/api/historial/${id}`);
  return await axios.put(`${API_URL}/api/historial/${id}`, data);
};

// Eliminar historial
export const deleteHistorialRequest = async (id) => {
  console.log('🗑️ DELETE a:', `${API_URL}/api/historial/${id}`);
  return await axios.delete(`${API_URL}/api/historial/${id}`);
};