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

// Importar el controlador de horarios
import { getHorariosDisponiblesPublicos } from '../controllers/horario.controller.js';

const router = Router();

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

// Obtener horarios disponibles (ruta principal - para usuarios autenticados)
router.get('/citas/horarios/:doctorId/:fecha', getHorariosDisponibles);

// Ruta pública para horarios (para HomePage) - USA EL CONTROLADOR CORRECTO
router.get('/public/horarios/:doctorId/:fecha', getHorariosDisponiblesPublicos);

// Crear cita (público para agendar sin login)
router.post('/citas', createCita);

// Confirmar cita desde el correo
router.get('/confirmar-cita/:id', confirmarCitaConToken);

// Cancelar cita desde el correo
router.get('/cancelar-cita/:id', cancelarCitaConToken);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

// Obtener citas por doctor
router.get('/citas/doctor/:doctorId', validateToken, getCitasByDoctor);

// Obtener citas por paciente
router.get('/citas/paciente/:pacienteId', validateToken, getCitasByPaciente);

// Obtener todas las citas
router.get('/citas', validateToken, getCitasRequest);

// Obtener una cita por ID
router.get('/citas/:id', validateToken, getCitaById);

// Actualizar cita
router.put('/citas/:id', validateToken, updateCita);

// Eliminar cita
router.delete('/citas/:id', validateToken, deleteCita);

export default router;