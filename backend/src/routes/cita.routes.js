// backend/src/routes/cita.routes.js
import { Router } from 'express';
import { 
  createCita,
  getHorariosDisponibles,
  getCitasByDoctor,
  getCitasByPaciente,
  updateCita,
  deleteCita,
  getCitasRequest,
  getCitaById,
  confirmarCitaConToken,
  cancelarCitaConToken
} from '../controllers/cita.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Rutas públicas (para agendar sin login)
router.get('/citas/horarios/:doctorId/:fecha', getHorariosDisponibles);
router.post('/citas', createCita);
// Rutas para confirmar/cancelar desde el correo (públicas, sin validateToken)
router.get('/confirmar-cita/:id', confirmarCitaConToken);
router.get('/cancelar-cita/:id', cancelarCitaConToken);

// ✅ AGREGAR ESTA RUTA PÚBLICA PARA COMPATIBILIDAD
router.get('/public/horarios/:doctorId/:fecha', getHorariosDisponibles);

// Rutas protegidas (requieren autenticación)
router.get('/citas/doctor/:doctorId', validateToken, getCitasByDoctor);
router.get('/citas/paciente/:pacienteId', validateToken, getCitasByPaciente);
router.put('/citas/:id', validateToken, updateCita);
router.delete('/citas/:id', validateToken, deleteCita);
router.get('/citas', validateToken, getCitasRequest);
router.get('/citas/:id', validateToken, getCitaById);

export default router;