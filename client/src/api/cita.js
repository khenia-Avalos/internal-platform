import axios from "./axios";

export const getHorariosDisponiblesRequest = (doctorId, fecha) => 
  axios.get(`/citas/horarios/${doctorId}/${fecha}?t=${Date.now()}`);
export const createCita = (cita) => axios.post("/citas", cita);
export const getCitasByDoctorRequest = (doctorId) => axios.get(`/citas/doctor/${doctorId}`); // ← CORREGIDO: recibe doctorId
export const getCitasByPacienteRequest = (pacienteId) => axios.get(`/citas/paciente/${pacienteId}`); // ← NUEVO: recibe pacienteId
export const updateCita = (id, data) => axios.put(`/citas/${id}`, data);
export const deleteCita = (id) => axios.delete(`/citas/${id}`);
export const getCitaById = (id) => axios.get(`/citas/${id}`);
export const getCitasRequest = () => axios.get("/citas");
export const getCitaByIdRequest = (id) => axios.get(`/citas/${id}`);
export const getHorariosDisponiblesPublicosRequest = (doctorId, fecha) => 
  axios.get(`/public/horarios/${doctorId}/${fecha}`);