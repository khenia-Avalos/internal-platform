import axios from "./axios";

export const getClientesRequest = () => axios.get("/clientes");
export const createClienteRequest = (cliente) => axios.post("/clientes", cliente);
export const updateClienteRequest = (id, cliente) => axios.put(`/clientes/${id}`, cliente);
export const deleteClienteRequest = (id) => axios.delete(`/clientes/${id}`);