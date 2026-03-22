import axios from "./axios";

export const iniciarPausaRequest = (data) => axios.post('/pausas/iniciar', data);
export const terminarPausaRequest = (id) => axios.put(`/pausas/terminar/${id}`);
export const getPausasActivasRequest = (doctorId) => axios.get(`/pausas/doctor/${doctorId}`);