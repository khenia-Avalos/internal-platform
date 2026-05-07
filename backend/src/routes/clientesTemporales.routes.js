import { Router } from 'express';
import { 
  getClientesTemporales,
  getClienteTemporalById,
  createClienteTemporal,
  completarRegistroClienteTemporal,
  deleteClienteTemporal,
  convertirCitaTemporal,
  getCitasTemporalesByCliente
} from '../controllers/clientesTemporales.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();
// Ruta pública para crear cliente temporal (sin autenticación)
router.post('/clientes-temporales', createClienteTemporal);



// Todas las rutas requieren autenticación
router.get('/clientes-temporales', validateToken, getClientesTemporales);
router.get('/clientes-temporales/:id', validateToken, getClienteTemporalById);
router.post('/clientes-temporales', validateToken, createClienteTemporal);
router.put('/clientes-temporales/:id/completar', validateToken, completarRegistroClienteTemporal);
router.delete('/clientes-temporales/:id', validateToken, deleteClienteTemporal);

// Rutas adicionales
router.get('/clientes-temporales/:id/citas', validateToken, getCitasTemporalesByCliente);
router.post('/clientes-temporales/:clienteId/citas/:citaTemporalIndex/convertir', validateToken, convertirCitaTemporal);

export default router;