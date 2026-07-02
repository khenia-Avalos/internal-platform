import axios from 'axios';

export const getHistorialByCitaRequest = async (citaId) => {
  return await axios.get(`/api/historial/cita/${citaId}`);
};

export const getHistorialByPacienteRequest = async (pacienteId) => {
  return await axios.get(`/api/historial/paciente/${pacienteId}`);
};

export const createHistorialRequest = async (data) => {
  return await axios.post('/api/historial', data);
};

export const updateHistorialRequest = async (id, data) => {
  return await axios.put(`/api/historial/${id}`, data);
};

export const deleteHistorialRequest = async (id) => {
  return await axios.delete(`/api/historial/${id}`);
};