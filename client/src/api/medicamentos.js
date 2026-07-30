// src/api/medicamentos.js
import axios from "./axios";

export const getMedicamentosRequest = () => axios.get("/medicamentos");
export const getMedicamentoByIdRequest = (id) => axios.get(`/medicamentos/${id}`);
export const buscarMedicamentosRequest = (query) => axios.get(`/medicamentos/buscar?q=${query}`);
export const createMedicamentoRequest = (data) => axios.post("/medicamentos", data);
export const updateMedicamentoRequest = (id, data) => axios.put(`/medicamentos/${id}`, data);
export const deleteMedicamentoRequest = (id) => axios.delete(`/medicamentos/${id}`);