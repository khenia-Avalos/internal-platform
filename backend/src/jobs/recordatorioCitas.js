import cron from 'node-cron';
import Cita from '../models/cita.model.js';
import { sendAppointmentReminderEmail, sendAppointmentConfirmationEmail } from '../services/authService.js';

const enviarRecordatorios = async () => {
  const ahora = new Date();
  const hoy = ahora.toISOString().split('T')[0];
  const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
  
  const citas = await Cita.find({ 
    fecha: hoy, 
    estado: { $ne: 'cancelada' },
    recordatorioEnviado: false 
  }).populate('doctorId pacienteId.ownerId clienteTemporalId');
  
  for (const cita of citas) {
    const [h, m] = cita.horaInicio.split(':').map(Number);
    const minutosCita = h * 60 + m;
    
    if (minutosCita - horaActual <= 120 && minutosCita - horaActual > 0) {
      let email, nombre;
      if (cita.pacienteId?.ownerId) {
        email = cita.pacienteId.ownerId.email;
        nombre = cita.pacienteId.ownerId.username;
      } else if (cita.clienteTemporalId) {
        email = cita.clienteTemporalId.email;
        nombre = cita.clienteTemporalId.username;
      }
      
      if (email) {
        if (cita.estado === 'pendiente') {
          await sendAppointmentConfirmationEmail(email, nombre, cita);
        } else {
          await sendAppointmentReminderEmail(email, nombre, cita);
        }
        cita.recordatorioEnviado = true;
        await cita.save();
      }
    }
  }
};

cron.schedule('*/15 * * * *', enviarRecordatorios, { timezone: "America/Costa_Rica" });
console.log('Recordatorios activado');s