import { Router } from 'express';
import { getClientes, createCliente,updateCliente,deleteCliente } from '../controllers/doctor.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Todas las rutas de clientes requieren autenticación
router.get('/clientes', validateToken, getClientes);
router.post('/clientes', validateToken, createCliente);
router.put('/clientes/:id', validateToken, updateCliente);
router.delete('/clientes/:id', validateToken, deleteCliente);
export default router;