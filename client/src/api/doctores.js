import axios from "./axios";

export const getDoctoresRequest = () => axios.get("/doctores");
export const createDoctorRequest = (doctor) => axios.post("/doctores", doctor);
export const updateDoctorRequest = (id, doctor) => axios.put(`/doctores/${id}`, doctor);
export const deleteDoctorRequest = (id) => axios.delete(`/doctores/${id}`);