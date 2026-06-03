import cron from 'node-cron';
import Cita from '../models/cita.model.js';
import { sendAppointmentConfirmationEmail } from '../services/authService.js';
import sgMail from '@sendgrid/mail';
import { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } from '../config.js';

// Configurar SendGrid
sgMail.setApiKey(SENDGRID_API_KEY);

const sendReminderEmail = async (email, nombre, cita) => {
  const fecha = new Date(cita.fecha).toLocaleDateString('es-CR', { timeZone: 'America/Costa_Rica' });
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
                <p><strong>Mascota:</strong> ${cita.pacienteId?.nombre || cita.pacienteTemporal?.nombre || 'No especificado'}</p>
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
  try {
    console.log('=== INICIANDO VERIFICACION DE RECORDATORIOS ===');
    
    // Obtener fecha y hora actual en Costa Rica
    const ahora = new Date();
    const offsetCostaRica = -6 * 60; // Costa Rica UTC-6
    const ahoraCR = new Date(ahora.getTime() + (offsetCostaRica - ahora.getTimezoneOffset()) * 60000);
    
    const año = ahoraCR.getFullYear();
    const mes = String(ahoraCR.getMonth() + 1).padStart(2, '0');
    const dia = String(ahoraCR.getDate()).padStart(2, '0');
    const hoy = `${año}-${mes}-${dia}`;
    
    const horaActualMinutos = ahoraCR.getHours() * 60 + ahoraCR.getMinutes();
    
    console.log(`Fecha actual Costa Rica: ${hoy}`);
    console.log(`Hora actual Costa Rica: ${ahoraCR.getHours()}:${ahoraCR.getMinutes()} (${horaActualMinutos} minutos)`);
    
    // Buscar citas para hoy
    const citas = await Cita.find({ 
      fecha: hoy, 
      estado: { $ne: 'cancelada' },
      recordatorioEnviado: false 
    }).populate('doctorId pacienteId.ownerId clienteTemporalId');
    
    console.log(`Citas encontradas para hoy: ${citas.length}`);
    
    for (const cita of citas) {
      const [h, m] = cita.horaInicio.split(':').map(Number);
      const minutosCita = h * 60 + m;
      const diferencia = minutosCita - horaActualMinutos;
      
      console.log(`Cita: ${cita._id}, Hora cita: ${cita.horaInicio}, Diferencia: ${diferencia} minutos`);
      
      if (diferencia > 0 && diferencia <= 120) {
        console.log(`-> Enviando recordatorio para cita ${cita._id}`);
        
        let email, nombre;
        if (cita.pacienteId?.ownerId) {
          email = cita.pacienteId.ownerId.email;
          nombre = cita.pacienteId.ownerId.username;
        } else if (cita.clienteTemporalId) {
          email = cita.clienteTemporalId.email;
          nombre = cita.clienteTemporalId.username;
        }
        
        if (email) {
          try {
            if (cita.estado === 'pendiente') {
              await sendAppointmentConfirmationEmail(email, nombre, cita);
              console.log(`  Correo de confirmacion enviado a ${email}`);
            } else if (cita.estado === 'confirmada') {
              await sendReminderEmail(email, nombre, cita);
              console.log(`  Recordatorio enviado a ${email}`);
            }
            cita.recordatorioEnviado = true;
            await cita.save();
            console.log(`  Marcado como enviado`);
          } catch (error) {
            console.error(`  Error enviando correo:`, error.message);
          }
        } else {
          console.log(`  No se encontro email para la cita`);
        }
      }
    }
    
    console.log('=== FIN VERIFICACION DE RECORDATORIOS ===');
  } catch (error) {
    console.error('ERROR en enviarRecordatorios:', error);
  }
};

// Iniciar el cron job SIN timezone (usar UTC y ajustar manualmente)
cron.schedule('*/15 * * * *', () => {
  console.log('CRON TRIGGERED - Ejecutando tarea programada');
  enviarRecordatorios();
});

console.log('Cron job de recordatorios iniciado - se ejecutara cada 15 minutos');