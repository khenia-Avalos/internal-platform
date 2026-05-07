import axios from "./axios";

export const getHorariosDisponiblesRequest = (doctorId, fecha) => 
  axios.get(`/citas/horarios/${doctorId}/${fecha}?t=${Date.now()}`);
export const createCita = (cita) => axios.post("/citas", cita);
export const getCitasByDoctor = () => axios.get("/citas/doctor"); 
export const getCitasByPaciente = () => axios.get("/citas/paciente");
export const updateCita = (id, data) => axios.put(`/citas/${id}`, data);
export const deleteCita = (id) => axios.delete(`/citas/${id}`);
export const getCitaById = (id) => axios.get(`/citas/${id}`);
export const getCitasRequest = () => axios.get("/citas");
export const getCitaByIdRequest = (id) => axios.get(`/citas/${id}`);
export const getHorariosDisponiblesPublicosRequest = (doctorId, fecha) => 
  axios.get(`/public/horarios/${doctorId}/${fecha}`);