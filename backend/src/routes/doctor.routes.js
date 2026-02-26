import { Router } from 'express';
import { getDoctores, createDoctor } from '../controllers/doctor.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Todas las rutas de doctores requieren autenticación
router.get('/doctores', validateToken, getDoctores);
router.post('/doctores', validateToken, createDoctor);
router.put('/doctores/:id', validateToken, updateDoctor);
router.delete('/doctores/:id', validateToken, deleteDoctor);
export default router;