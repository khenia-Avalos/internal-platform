import axios from 'axios';

// Crear historial
export const crearHistorialRequest = async (citaId, data) => {
  return await axios.post(`/api/citas/${citaId}/historial`, data);
};

// Obtener historial
export const obtenerHistorialRequest = async (citaId) => {
  return await axios.get(`/api/citas/${citaId}/historial`);
};

// Actualizar historial
export const actualizarHistorialRequest = async (citaId, data) => {
  return await axios.put(`/api/citas/${citaId}/historial`, data);
};