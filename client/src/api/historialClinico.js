import axios from 'axios';

// url completa del backend en produccion
const API_URL = 'https://el-exito-internal-platform.onrender.com';

// configuracion para enviar cookies con cada peticion
axios.defaults.withCredentials = true;

// obtener historial por cita
export const getHistorialByCitaRequest = async (citaId) => {
  console.log('get a:', `${API_URL}/api/historial/cita/${citaId}`);
  try {
    const response = await axios.get(`${API_URL}/api/historial/cita/${citaId}`);
    console.log('get respuesta:', response.data);
    return response;
  } catch (error) {
    console.error('get error:', error.response?.data || error.message);
    throw error;
  }
};

// obtener historial por paciente
export const getHistorialByPacienteRequest = async (pacienteId) => {
  console.log('get a:', `${API_URL}/api/historial/paciente/${pacienteId}`);
  return await axios.get(`${API_URL}/api/historial/paciente/${pacienteId}`);
};

// obtener historial por id
export const getHistorialByIdRequest = async (id) => {
  console.log('get a:', `${API_URL}/api/historial/${id}`);
  return await axios.get(`${API_URL}/api/historial/${id}`);
};

// crear historial
export const createHistorialRequest = async (data) => {
  console.log('post a:', `${API_URL}/api/historial`);
  console.log('datos:', data);
  try {
    const response = await axios.post(`${API_URL}/api/historial`, data);
    console.log('post respuesta:', response.data);
    return response;
  } catch (error) {
    console.error('post error:', error.response?.data || error.message);
    throw error;
  }
};

// actualizar historial
export const updateHistorialRequest = async (id, data) => {
  console.log('put a:', `${API_URL}/api/historial/${id}`);
  console.log('datos:', data);
  return await axios.put(`${API_URL}/api/historial/${id}`, data);
};

// eliminar historial
export const deleteHistorialRequest = async (id) => {
  console.log('delete a:', `${API_URL}/api/historial/${id}`);
  return await axios.delete(`${API_URL}/api/historial/${id}`);
};