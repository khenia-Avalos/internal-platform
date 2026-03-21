import axios from "./axios";

export const getInternadosByPacienteRequest = (pacienteId) => axios.get(`/internados/paciente/${pacienteId}`);
export const createInternadoRequest = (internado) => axios.post('/internados', internado);
export const updateInternadoRequest = (id, internado) => axios.put(`/internados/${id}`, internado);
export const deleteInternadoRequest = (id) => axios.delete(`/internados/${id}`);
export const getInternadoByIdRequest = (id) => axios.get(`/internados/${id}`);