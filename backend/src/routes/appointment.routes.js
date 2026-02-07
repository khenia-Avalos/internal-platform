import { Router } from 'express';
import { 
  getAppointments, 
  getAppointment, 
  createAppointment, 
  updateAppointment, 
  updateAppointmentStatus,
  deleteAppointment,
  getAppointmentsStats
} from '../controllers/appointment.controller.js';
import { validateToken } from '../middlewares/validateToken.js';

const router = Router();
router.use(validateToken);

router.get('/appointments', getAppointments);
router.get('/appointments/stats', getAppointmentsStats);
router.get('/appointments/:id', getAppointment);
router.post('/appointments', createAppointment);
router.put('/appointments/:id', updateAppointment);
router.patch('/appointments/:id/status', updateAppointmentStatus);
router.delete('/appointments/:id', deleteAppointment);

export default router;