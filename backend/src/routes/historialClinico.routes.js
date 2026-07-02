import { Router } from 'express';
import { 
  getHistorialByCita,
  getHistorialByPaciente,
  createHistorial,
  updateHistorial,
  deleteHistorial,
  getHistorialById
} from '../controllers/historialClinico.controller.js';

const router = Router();

// 🔥 SIN AUTENTICACIÓN TEMPORALMENTE PARA PROBAR
router.get('/cita/:citaId', getHistorialByCita);
router.get('/paciente/:pacienteId', getHistorialByPaciente);
router.get('/:id', getHistorialById);
router.post('/', createHistorial);
router.put('/:id', updateHistorial);
router.delete('/:id', deleteHistorial);

export default router;