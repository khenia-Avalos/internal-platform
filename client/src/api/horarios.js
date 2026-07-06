// src/api/horarios.js
import axios from "./axios";

export const getHorariosByDoctorRequest = (doctorId) => axios.get(`/horarios/doctor/${doctorId}`);
export const createHorarioRequest = (horario) => axios.post('/horarios', horario);
export const updateHorarioRequest = (id, horario) => axios.put(`/horarios/${id}`, horario);
export const deleteHorarioRequest = (id) => axios.delete(`/horarios/${id}`);

// ========== NUEVA FUNCIÓN ==========
export const updateHorariosByDoctorRequest = (doctorId, data) => 
  axios.put(`/horarios/doctor/${doctorId}/batch`, data);