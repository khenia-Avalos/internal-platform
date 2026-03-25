import { Router } from 'express';
import { 
  createCita,
  getHorariosDisponibles,
  getCitasByDoctor,
  getCitasByPaciente,
  updateCita,
  deleteCita
} from '../controllers/cita.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Rutas públicas (para agendar sin login)
router.get('/citas/horarios/:doctorId/:fecha/:duracionCita', getHorariosDisponibles);
router.post('/citas', createCita);

// Rutas protegidas (requieren autenticación)
router.get('/citas/doctor/:doctorId', validateToken, getCitasByDoctor);
router.get('/citas/paciente/:pacienteId', validateToken, getCitasByPaciente);
router.put('/citas/:id', validateToken, updateCita);
router.delete('/citas/:id', validateToken, deleteCita);

export default router;