import { Router } from 'express';
import { 
  getHistorialByCita,
  getHistorialByPaciente,
  createHistorial,
  updateHistorial,
  deleteHistorial,
  getHistorialById
} from '../controllers/historialClinico.controller.js';
// 🔥 AUTENTICACIÓN COMENTADA TEMPORALMENTE PARA PROBAR
// import { validateToken, adminRequired } from '../middlewares/validateToken.js';

const router = Router();

console.log('🔄 Configurando rutas de historial clínico...');

// 🔥 AUTENTICACIÓN COMENTADA TEMPORALMENTE
// router.use(validateToken);
// console.log('✅ Middleware validateToken aplicado');

// Rutas de lectura - cualquier usuario autenticado puede ver
router.get('/cita/:citaId', getHistorialByCita);
console.log('✅ Ruta GET /cita/:citaId registrada');

router.get('/paciente/:pacienteId', getHistorialByPaciente);
console.log('✅ Ruta GET /paciente/:pacienteId registrada');

router.get('/:id', getHistorialById);
console.log('✅ Ruta GET /:id registrada');

// Rutas de escritura - SIN AUTENTICACIÓN TEMPORALMENTE
router.post('/', createHistorial);
console.log('✅ Ruta POST / registrada');

router.put('/:id', updateHistorial);
console.log('✅ Ruta PUT /:id registrada');

router.delete('/:id', deleteHistorial);
console.log('✅ Ruta DELETE /:id registrada');

console.log('✅ Todas las rutas de historial configuradas');

export default router;