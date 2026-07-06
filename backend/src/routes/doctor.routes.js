import { Router } from 'express';
import { 
    getDoctores, 
    createDoctor, 
    updateDoctor, 
    deleteDoctor, 
    getDoctorByIdRequest, 
    getDoctoresPublicos,
    bloquearDoctor,           // NUEVA
    activarVacaciones,        // NUEVA
    desactivarVacaciones      // NUEVA
} from '../controllers/doctor.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();

// Ruta publica para obtener doctores (sin autenticación)
router.get('/public/doctores', getDoctoresPublicos);

// Todas las rutas de doctores requieren autenticación
router.get('/doctores', validateToken, getDoctores);
router.post('/doctores', validateToken, createDoctor);
router.put('/doctores/:id', validateToken, updateDoctor);
router.delete('/doctores/:id', validateToken, deleteDoctor);
router.get('/doctores/:id', validateToken, getDoctorByIdRequest);

// ========== NUEVAS RUTAS ==========
router.put('/doctores/:id/bloquear', validateToken, bloquearDoctor);
router.put('/doctores/:id/vacaciones/activar', validateToken, activarVacaciones);
router.put('/doctores/:id/vacaciones/desactivar', validateToken, desactivarVacaciones);

export default router;