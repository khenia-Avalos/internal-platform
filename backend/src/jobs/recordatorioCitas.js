import cron from 'node-cron';
import Cita from '../models/cita.model.js';
import { sendAppointmentConfirmationEmail } from '../services/authService.js';

// Función simple para recordatorio (puedes poner HTML básico aquí o crear una nueva)
const sendReminderEmail = async (email, nombre, cita) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "Recordatorio de cita - El Exito",
    html: `<h1>Recordatorio</h1><p>Hola ${nombre}, tu cita es en 2 horas.</p><p>Fecha: ${new Date(cita.fecha).toLocaleDateString('es-CR')}</p><p>Hora: ${cita.horaInicio} - ${cita.horaFin}</p>`
  };
  await sgMail.send(msg);
};

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
          // Usar la función que YA existe
          await sendAppointmentConfirmationEmail(email, nombre, cita);
        } else {
          // Usar la función nueva de recordatorio
          await sendReminderEmail(email, nombre, cita);
        }
        cita.recordatorioEnviado = true;
        await cita.save();
      }
    }
  }
};

cron.schedule('*/15 * * * *', enviarRecordatorios, { timezone: "America/Costa_Rica" });