import axios from 'axios';

// ============================================
// 🔥 HISTORIAL CLÍNICO - API
// ============================================

// Crear historial clínico para una cita
export const crearHistorialRequest = async (citaId, data) => {
  return await axios.post(`/api/citas/${citaId}/historial`, data);
};

// Obtener historial clínico de una cita
export const obtenerHistorialRequest = async (citaId) => {
  return await axios.get(`/api/citas/${citaId}/historial`);
};

// Actualizar historial clínico de una cita
export const actualizarHistorialRequest = async (citaId, data) => {
  return await axios.put(`/api/citas/${citaId}/historial`, data);
};

// ============================================
// ⚠️ ALIAS PARA COMPATIBILIDAD CON NOMBRES ANTIGUOS
// ============================================
export const getHistorialByCitaRequest = obtenerHistorialRequest;
export const createHistorialRequest = crearHistorialRequest;
export const updateHistorialRequest = actualizarHistorialRequest;