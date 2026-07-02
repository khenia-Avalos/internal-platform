import axios from 'axios';

// Obtener historial por cita
export const getHistorialByCitaRequest = async (citaId) => {
  return await axios.get(`/api/historial/cita/${citaId}`);
};

// Obtener historial por paciente
export const getHistorialByPacienteRequest = async (pacienteId) => {
  return await axios.get(`/api/historial/paciente/${pacienteId}`);
};

// Obtener historial por ID
export const getHistorialByIdRequest = async (id) => {
  return await axios.get(`/api/historial/${id}`);
};

// Crear historial
export const createHistorialRequest = async (data) => {
  return await axios.post('/api/historial', data);
};

// Actualizar historial
export const updateHistorialRequest = async (id, data) => {
  return await axios.put(`/api/historial/${id}`, data);
};

// Eliminar historial
export const deleteHistorialRequest = async (id) => {
  return await axios.delete(`/api/historial/${id}`);
};