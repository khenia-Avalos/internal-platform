import { Router } from 'express';
import { 
  getAppointments, 
  getAppointmentsByRange,
  createAppointment, 
  updateAppointment,
  updateAppointmentStatus,
  getAppointmentStats
} from '../controllers/appointment.controller.js';
import { validateToken } from '../middlewares/validateToken.js';
import { validateSchema } from '../middlewares/validator.middleware.js';
import { createAppointmentSchema, updateAppointmentSchema } from '../schemas/appointment.schema.js';

const router = Router();
router.use(validateToken);

router.get('/appointments', getAppointments);
router.get('/appointments/range', getAppointmentsByRange);
router.get('/appointments/stats', getAppointmentStats);
router.post('/appointments', validateSchema(createAppointmentSchema), createAppointment);
router.put('/appointments/:id', validateSchema(updateAppointmentSchema), updateAppointment);
router.patch('/appointments/:id/status', updateAppointmentStatus);

export default router;