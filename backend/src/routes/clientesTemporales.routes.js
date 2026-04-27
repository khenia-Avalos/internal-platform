import { Router } from 'express';
import { 
  getClientesTemporales,
  getClienteTemporalById,
  createClienteTemporal,
  completarRegistroClienteTemporal,
  deleteClienteTemporal
} from '../controllers/clientesTemporales.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

router.get('/clientes-temporales', validateToken, getClientesTemporales);
router.get('/clientes-temporales/:id', validateToken, getClienteTemporalById);
router.post('/clientes-temporales', validateToken, createClienteTemporal);
router.put('/clientes-temporales/:id/completar', validateToken, completarRegistroClienteTemporal);
router.delete('/clientes-temporales/:id', validateToken, deleteClienteTemporal);

export default router;