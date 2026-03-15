import { Router } from 'express';
import { getPaciente,getPacienteByOwner, getPacienteById,createPaciente,updatePaciente,deletePaciente } from '../controllers/pacientes.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Todas las rutas de pacientes requieren autenticación
router.get('/pacientes', validateToken, getPaciente);
router.post('/pacientes', validateToken, createPaciente);
router.put('/pacientes/:id', validateToken, updatePaciente);
router.delete('/pacientes/:id', validateToken, deletePaciente);
router.get('/pacientes/owner/:ownerId', validateToken, getPacienteByOwner);
router.get('/pacientes/:id', validateToken, getPacienteById);

export default router;