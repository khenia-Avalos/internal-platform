import { Router } from 'express';
import { getClientes,getClienteById, createCliente,updateCliente,deleteCliente } from '../controllers/owner.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Todas las rutas de clientes requieren autenticación
router.get('/clientes', validateToken, getClientes);
router.post('/clientes', validateToken, createCliente);
router.put('/clientes/:id', validateToken, updateCliente);
router.delete('/clientes/:id', validateToken, deleteCliente);
router.get('/clientes/:id', validateToken, getClienteById);

export default router;