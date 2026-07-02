import { Router } from 'express';
import { 
  getHistorialByCita,
  getHistorialByPaciente,
  createHistorial,
  updateHistorial,
  deleteHistorial,
  getHistorialById
} from '../controllers/historialClinico.controller.js';
import { validateToken, adminRequired } from '../middlewares/validateToken.js';

const router = Router();

// 🔥 TODAS las rutas requieren autenticación
router.use(validateToken);

// Rutas de lectura - cualquier usuario autenticado puede ver
router.get('/cita/:citaId', getHistorialByCita);
router.get('/paciente/:pacienteId', getHistorialByPaciente);
router.get('/:id', getHistorialById);

// Rutas de escritura - SOLO admin y doctor pueden
router.post('/', adminRequired, createHistorial);
router.put('/:id', adminRequired, updateHistorial);
router.delete('/:id', adminRequired, deleteHistorial);

export default router;