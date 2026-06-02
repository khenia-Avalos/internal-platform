import cron from 'node-cron';
import Cita from '../models/cita.model.js';
import { sendAppointmentConfirmationEmail } from '../services/authService.js';
import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } from '../config.js';

// Configurar SendGrid
sgMail.setApiKey(SENDGRID_API_KEY);

// Funcion para recordatorio de cita confirmada
const sendReminderEmail = async (email, nombre, cita) => {
  const fecha = new Date(cita.fecha).toLocaleDateString('es-CR');
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0891b2; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #e0f2fe; padding: 15px; border-radius: 10px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Recordatorio de cita</h1>
        </div>
        <div class="content">
            <h2>Hola ${nombre},</h2>
            <p>Te recordamos que tienes una cita programada en 2 horas.</p>
            <div class="info-box">
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Hora:</strong> ${cita.horaInicio} - ${cita.horaFin}</p>
                <p><strong>Veterinario:</strong> ${cita.doctorId?.username} ${cita.doctorId?.lastname || ''}</p>
            </div>
            <p><strong>Importante:</strong> Por favor, llega 10 minutos antes.</p>
        </div>
        <div class="footer">
            <p>El Exito - Clinica Veterinaria</p>
        </div>
    </div>
</body>
</html>`;
  
  const msg = {
    to: email,
    from: SENDGRID_FROM_EMAIL,
    subject: "Recordatorio de cita - El Exito",
    html: html,
  };
  
  await sgMail.send(msg);
};

const enviarRecordatorios = async () => {
  console.log('=== INICIANDO VERIFICACION DE RECORDATORIOS ===');
  
  const ahora = new Date();
  const horaActualUTC = ahora.getUTCHours() * 60 + ahora.getUTCMinutes();
  
  // Costa Rica es UTC-6
  const horaActualCR = horaActualUTC - 360;
  if (horaActualCR < 0) {
    horaActualCR += 1440;
  }
  
  console.log('Fecha y hora actual UTC:', ahora.toISOString());
  console.log('Hora actual Costa Rica (minutos):', horaActualCR);
  
  const hoy = ahora.toISOString().split('T')[0];
  
  console.log(`Buscando citas para fecha: ${hoy}`);
  
  const citas = await Cita.find({ 
    fecha: hoy, 
    estado: { $ne: 'cancelada' },
    recordatorioEnviado: false 
  }).populate('doctorId pacienteId.ownerId clienteTemporalId');
  
  console.log(`Citas encontradas: ${citas.length}`);
  
  for (const cita of citas) {
    const [h, m] = cita.horaInicio.split(':').map(Number);
    const minutosCitaCR = h * 60 + m;
    
    const diferencia = minutosCitaCR - horaActualCR;
    
    console.log(`Cita ID: ${cita._id}, Hora CR: ${cita.horaInicio}, Minutos cita CR: ${minutosCitaCR}, Diferencia: ${diferencia} minutos`);
    
    // Si la cita es en las proximas 2 horas (diferencia entre 0 y 120 minutos)
    if (diferencia > 0 && diferencia <= 120) {
      console.log(`Cita en rango de 2 horas - procesando...`);
      
      let email, nombre;
      if (cita.pacienteId?.ownerId) {
        email = cita.pacienteId.ownerId.email;
        nombre = cita.pacienteId.ownerId.username;
      } else if (cita.clienteTemporalId) {
        email = cita.clienteTemporalId.email;
        nombre = cita.clienteTemporalId.username;
      }
      
      if (email) {
        console.log(`Enviando correo a: ${email}, Estado cita: ${cita.estado}`);
        try {
          if (cita.estado === 'pendiente') {
            await sendAppointmentConfirmationEmail(email, nombre, cita);
            console.log(`Correo de confirmacion enviado a ${email}`);
          } else if (cita.estado === 'confirmada') {
            await sendReminderEmail(email, nombre, cita);
            console.log(`Recordatorio enviado a ${email}`);
          }
          cita.recordatorioEnviado = true;
          await cita.save();
        } catch (error) {
          console.error(`Error enviando correo a ${email}:`, error.message);
        }
      } else {
        console.log(`No se encontro email para cita ${cita._id}`);
      }
    }
  }
  
  console.log('=== FIN VERIFICACION DE RECORDATORIOS ===');
};

// Iniciar el cron job
cron.schedule('*/15 * * * *', enviarRecordatorios, { timezone: "America/Costa_Rica" });
console.log('Cron job de recordatorios iniciado - se ejecutara cada 15 minutos');