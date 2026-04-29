// src/api/ClientesTemporales.js
import axios from "./axios";

export const getClientesTemporalesRequest = () => axios.get("/clientes-temporales");
export const getClienteTemporalByIdRequest = (id) => axios.get(`/clientes-temporales/${id}`);
export const createClienteTemporalRequest = (data) => axios.post("/clientes-temporales", data);
export const completarRegistroClienteTemporalRequest = (id, data) => axios.put(`/clientes-temporales/${id}/completar`, data);
export const deleteClienteTemporalRequest = (id) => axios.delete(`/clientes-temporales/${id}`);