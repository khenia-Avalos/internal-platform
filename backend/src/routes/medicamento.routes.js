// backend/src/routes/medicamento.routes.js
import { Router } from 'express';
import { 
  getMedicamentos,
  getMedicamentoById,
  buscarMedicamentos,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento
} from '../controllers/medicamento.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Rutas públicas (sin autenticación) - opcional
// router.get('/public/medicamentos', getMedicamentos);

// Rutas protegidas (requieren autenticación)
router.get('/medicamentos', validateToken, getMedicamentos);
router.get('/medicamentos/buscar', validateToken, buscarMedicamentos);
router.get('/medicamentos/:id', validateToken, getMedicamentoById);
router.post('/medicamentos', validateToken, createMedicamento);
router.put('/medicamentos/:id', validateToken, updateMedicamento);
router.delete('/medicamentos/:id', validateToken, deleteMedicamento);

export default router;
