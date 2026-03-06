import axios from "./axios";

export const getPacienteRequest = () => axios.get("/pacientes");
export const createPacienteRequest = (paciente) => axios.post("/pacientes", paciente);
export const updatePacienteRequest = (id, paciente) => axios.put(`/pacientes/${id}`, paciente);
export const deletePacienteRequest = (id) => axios.delete(`/pacientes/${id}`);