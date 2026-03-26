import axios from "./axios";


export const getHorariosDisponiblesRequest = (doctorId, fecha, duracionCita) => 
  axios.get(`/citas/horarios/${doctorId}/${fecha}/${duracionCita}`);