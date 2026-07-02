import { Router } from 'express';
import { 
  getHistorialByCita,
  getHistorialByPaciente,
  createHistorial,
  updateHistorial,
  deleteHistorial,
  getHistorialById
} from '../controllers/historialClinico.controller.js';
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// Obtener historial por cita
router.get('/cita/:citaId', getHistorialByCita);

// Obtener historial por paciente (todos los registros)
router.get('/paciente/:pacienteId', getHistorialByPaciente);

// Obtener un registro por ID
router.get('/:id', getHistorialById);

// Crear nuevo registro clínico
router.post('/', createHistorial);

// Actualizar registro clínico
router.put('/:id', updateHistorial);

// Eliminar registro clínico
router.delete('/:id', deleteHistorial);

export default router;