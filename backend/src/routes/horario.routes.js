import { Router } from 'express';
import { getHorariosByDoctor, createHorario,updateHorario,deleteHorario } from '../controllers/horario.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Todas las rutas de horarios requieren autenticación
router.get('/horarios/doctor/:doctorId', validateToken, getHorariosByDoctor);
router.post('/horarios', validateToken, createHorario);
router.put('/horarios/:id', validateToken, updateHorario);
router.delete('/horarios/:id', validateToken, deleteHorario);
export default router;