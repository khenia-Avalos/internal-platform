import { Router } from 'express';
import { getDoctores, createDoctor,updateDoctor,deleteDoctor,getDoctorByIdRequest } from '../controllers/doctor.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Todas las rutas de doctores requieren autenticación
router.get('/doctores', validateToken, getDoctores);
router.post('/doctores', validateToken, createDoctor);
router.put('/doctores/:id', validateToken, updateDoctor);
router.delete('/doctores/:id', validateToken, deleteDoctor);
router.get('/doctores/:id', validateToken, getDoctorByIdRequest);
export default router;