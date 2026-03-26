import axios from "./axios";


export const getHorariosDisponiblesRequest = (doctorId, fecha, duracionCita) => 
  axios.get(`/citas/horarios/${doctorId}/${fecha}/${duracionCita}`);
export const createCita = (cita) => axios.post("/citas", cita);
export const getCitasByDoctor = () => axios.get("/citas/doctor"); 
export const getCitasByPaciente = () => axios.get("/citas/paciente");
export const updateCita = (id, cita) => axios.put(`/citas/${id}`, cita);
export const deleteCita = (id) => axios.delete(`/citas/${id}`);
export const getCitaById = (id) => axios.get(`/citas/${id}`);
