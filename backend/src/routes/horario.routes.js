import { Router } from 'express';
import { getHorariosByDoctorRequest, createHorario,updateHorario,deleteHorario, getHorariosDisponiblesPublicos } from '../controllers/horario.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();
//ruta publica para obtener horarios disponibles de un doctor en una fecha específica (sin autenticación)
router.get('/public/horarios/:doctorId/:fecha', getHorariosDisponiblesPublicos);

// Todas las rutas de horarios requieren autenticación
router.get('/horarios/doctor/:doctorId', validateToken, getHorariosByDoctorRequest);
router.post('/horarios', validateToken, createHorario);
router.put('/horarios/:id', validateToken, updateHorario);
router.delete('/horarios/:id', validateToken, deleteHorario);
export default router;