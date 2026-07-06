import axios from "./axios";

export const getDoctoresRequest = () => axios.get("/doctores");
export const createDoctorRequest = (doctor) => axios.post("/doctores", doctor);
export const updateDoctorRequest = (id, doctor) => axios.put(`/doctores/${id}`, doctor);
export const deleteDoctorRequest = (id) => axios.delete(`/doctores/${id}`);
export const getDoctorByIdRequest = (id) => axios.get(`/doctores/${id}`);
export const getDoctoresPublicosRequest = () => axios.get("/public/doctores");

// ========== NUEVAS FUNCIONES ==========
export const bloquearDoctorRequest = (id) => axios.put(`/doctores/${id}/bloquear`);
export const activarVacacionesRequest = (id) => axios.put(`/doctores/${id}/vacaciones/activar`);
export const desactivarVacacionesRequest = (id) => axios.put(`/doctores/${id}/vacaciones/desactivar`);