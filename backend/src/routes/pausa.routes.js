import { Router } from 'express';
import { 
  iniciarPausa, 
  terminarPausa, 
  getPausasActivas,
  getHistorialPausas,        // NUEVA FUNCIÓN
  getHistorialPausasPorFecha // OPCIONAL
} from '../controllers/pausa.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Todas las rutas requieren autenticación
router.post('/pausas/iniciar', validateToken, iniciarPausa);
router.put('/pausas/terminar/:id', validateToken, terminarPausa);
router.get('/pausas/doctor/:doctorId', validateToken, getPausasActivas);

// NUEVAS RUTAS para el historial
router.get('/pausas/doctor/:doctorId/historial', validateToken, getHistorialPausas);
router.get('/pausas/doctor/:doctorId/historial/fechas', validateToken, getHistorialPausasPorFecha);

export default router;