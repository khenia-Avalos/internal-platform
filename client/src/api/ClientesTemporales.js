import axios from "./axios";


// Obtener todos los clientes temporales
export const getClientesTemporalesRequest = () => axios.get("/clientes-temporales");

// Obtener cliente temporal por ID
export const getClienteTemporalByIdRequest = (id) => axios.get(`/clientes-temporales/${id}`);

// Crear cliente temporal (agendamiento rápido)
export const createClienteTemporalRequest = (clienteTemporal) => axios.post("/clientes-temporales", clienteTemporal);

// Completar registro de cliente temporal (convertir a cliente completo)
export const completarRegistroClienteTemporalRequest = (id, data) => axios.put(`/clientes-temporales/${id}/completar`, data);

// Eliminar cliente temporal
export const deleteClienteTemporalRequest = (id) => axios.delete(`/clientes-temporales/${id}`);

// Obtener citas temporales de un cliente
export const getCitasTemporalesByClienteRequest = (id) => axios.get(`/clientes-temporales/${id}/citas`);

// Convertir cita temporal a cita real
export const convertirCitaTemporalRequest = (clienteId, citaIndex, data) => 
  axios.post(`/clientes-temporales/${clienteId}/citas/${citaIndex}/convertir`, data);