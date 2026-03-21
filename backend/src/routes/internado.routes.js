import { Router } from 'express';
import { getInternadosByPaciente, createInternado,updateInternado,deleteInternado,getInternadosById } from '../controllers/internado.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Todas las rutas de internados requieren autenticación
router.get('/internados/paciente/:pacienteId', validateToken, getInternadosByPaciente);  
router.get('/internados/:id', validateToken, getInternadosById);

router.post('/internados', validateToken, createInternado);
router.put('/internados/:id', validateToken, updateInternado);
router.delete('/internados/:id', validateToken, deleteInternado);
export default router;