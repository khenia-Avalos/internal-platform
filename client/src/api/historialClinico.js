import axios from 'axios';

// 🔥 URL COMPLETA DEL BACKEND EN PRODUCCIÓN
const API_URL = 'https://el-exito-internal-platform.onrender.com';

// 🔥 CONFIGURACIÓN PARA ENVIAR COOKIES CON CADA PETICIÓN
axios.defaults.withCredentials = true;

// Obtener historial por cita
export const getHistorialByCitaRequest = async (citaId) => {
  console.log('🔍 GET a:', `${API_URL}/api/historial/cita/${citaId}`);
  try {
    const response = await axios.get(`${API_URL}/api/historial/cita/${citaId}`);
    console.log('✅ GET respuesta:', response.data);
    return response;
  } catch (error) {
    console.error('❌ GET error:', error.response?.data || error.message);
    throw error;
  }
};

// Obtener historial por paciente
export const getHistorialByPacienteRequest = async (pacienteId) => {
  console.log('🔍 GET a:', `${API_URL}/api/historial/paciente/${pacienteId}`);
  return await axios.get(`${API_URL}/api/historial/paciente/${pacienteId}`);
};

// Obtener historial por ID
export const getHistorialByIdRequest = async (id) => {
  console.log('🔍 GET a:', `${API_URL}/api/historial/${id}`);
  return await axios.get(`${API_URL}/api/historial/${id}`);
};

// Crear historial
export const createHistorialRequest = async (data) => {
  console.log('🔥 POST a:', `${API_URL}/api/historial`);
  console.log('📝 Datos:', data);
  try {
    const response = await axios.post(`${API_URL}/api/historial`, data);
    console.log('✅ POST respuesta:', response.data);
    return response;
  } catch (error) {
    console.error('❌ POST error:', error.response?.data || error.message);
    throw error;
  }
};

// Actualizar historial
export const updateHistorialRequest = async (id, data) => {
  console.log('🔥 PUT a:', `${API_URL}/api/historial/${id}`);
  console.log('📝 Datos:', data);
  return await axios.put(`${API_URL}/api/historial/${id}`, data);
};

// Eliminar historial
export const deleteHistorialRequest = async (id) => {
  console.log('🗑️ DELETE a:', `${API_URL}/api/historial/${id}`);
  return await axios.delete(`${API_URL}/api/historial/${id}`);
};