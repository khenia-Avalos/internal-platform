import { Router } from 'express';
import { 
  iniciarPausa, 
  terminarPausa, 
  getPausasActivas 
} from '../controllers/pausa.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Todas las rutas requieren autenticación
router.post('/pausas/iniciar', validateToken, iniciarPausa);
router.put('/pausas/terminar/:id', validateToken, terminarPausa);
router.get('/pausas/doctor/:doctorId', validateToken, getPausasActivas);

export default router;