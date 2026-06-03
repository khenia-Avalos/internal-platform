import { createAccessToken } from "../libs/jwt.js";
import {
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
  FRONTEND_URL,
  NODE_ENV,
} from "../config.js";
import User from "../models/user.model.js";
import Owner from "../models/owner.model.js";

// SECTION: SENDGRID INITIALIZATION


let sgMail;

// Configure SendGrid once
try {
  sgMail = (await import("@sendgrid/mail")).default;
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("SendGrid configurado");
} catch (error) {
  console.error("Error configurando SendGrid:", error.message);
  throw new Error("SendGrid no pudo ser configurado");
}

// SECTION: EMAIL SERVICE CLASS

class EmailService {
  
  // APPOINTMENT CONFIRMATION EMAIL
  
  async sendAppointmentConfirmation(toEmail, nombreCliente, cita) {
    try {
      const subject = "Confirmación de Cita - Clínica Veterinaria";
      const html = this.getAppointmentHtmlTemplate(nombreCliente, cita);
      const text = this.getAppointmentTextTemplate(nombreCliente, cita);

      if (!sgMail) {
        throw new Error("SendGrid no está configurado");
      }

      const msg = {
        to: toEmail,
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: "Clínica Veterinaria",
        },
        subject: subject,
        html: html,
        text: text,
        trackingSettings: {
          openTracking: { enable: true },
        },
        category: "appointment-confirmation",
      };

      const response = await sgMail.send(msg);

      return {
        success: true,
        service: "sendgrid",
        messageId: response[0]?.headers?.["x-message-id"] || response[0]?.messageId,
      };
    } catch (error) {
      console.error("Error enviando correo de confirmación:", error.message);
      if (error.response) {
        console.error("Detalles de SendGrid:", error.response.body);
      }
      throw error;
    }
  }

  getAppointmentHtmlTemplate(nombreCliente, cita) {
    const fecha = new Date(cita.fecha).toLocaleDateString('es-CR');
    const horaInicio = cita.horaInicio;
    const horaFin = cita.horaFin;
    
    let nombreMascota = 'No especificado';
    if (cita.pacienteId?.nombre) {
      nombreMascota = cita.pacienteId.nombre;
    } else if (cita.pacienteTemporal?.nombre) {
      nombreMascota = cita.pacienteTemporal.nombre;
    }
    
    const BACKEND_URL = "https://el-exito-internal-platform.onrender.com";
    const confirmarUrl = `${BACKEND_URL}/api/confirmar-cita/${cita._id}?token=${cita.tokenConfirmacion}`;
    const cancelarUrl = `${BACKEND_URL}/api/cancelar-cita/${cita._id}?token=${cita.tokenConfirmacion}`;
    const whatsappUrl = `https://wa.me/50670932898?text=Hola%2C%20quisiera%20reagendar%20mi%20cita%20del%20${fecha}%20a%20las%20${horaInicio}`;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px; }
        .button-cancel { background: #f44336; }
        .button-wa { background: #25D366; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .actions { text-align: center; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Confirmación de Cita</h1>
        </div>
        <div class="content">
            <h2>Hola ${nombreCliente},</h2>
            <p>Tu cita ha sido <strong>agendada exitosamente</strong>.</p>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Hora:</strong> ${horaInicio} - ${horaFin}</p>
                <p><strong>Doctor:</strong> ${cita.doctorId?.username} ${cita.doctorId?.lastname || ''}</p>
                <p><strong>Mascota:</strong> ${nombreMascota}</p>
                <p><strong>Tipo de Cita:</strong> ${cita.tipoCita || 'Consulta general'}</p>
            </div>
            
            <div class="actions">
                <a href="${confirmarUrl}" class="button">Confirmar Cita</a>
                <a href="${cancelarUrl}" class="button button-cancel">Cancelar Cita</a>
                <a href="${whatsappUrl}" class="button button-wa" target="_blank">Reagendar vía WhatsApp</a>
            </div>
            
            <p><strong>Importante:</strong> Si necesitas modificar tu cita, puedes usar los botones de arriba.</p>
            <p><small>Este enlace es personal e intransferible. Caduca en 7 días.</small></p>
        </div>
        <div class="footer">
            <p>(c) ${new Date().getFullYear()} Clínica Veterinaria. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }

  getAppointmentTextTemplate(nombreCliente, cita) {
    const fecha = new Date(cita.fecha).toLocaleDateString('es-CR');
    
    let nombreMascota = 'No especificado';
    if (cita.pacienteId?.nombre) {
      nombreMascota = cita.pacienteId.nombre;
    } else if (cita.pacienteTemporal?.nombre) {
      nombreMascota = cita.pacienteTemporal.nombre;
    }
    
    return `CONFIRMACIÓN DE CITA

Hola ${nombreCliente},

Tu cita ha sido agendada exitosamente.

Fecha: ${fecha}
Hora: ${cita.horaInicio} - ${cita.horaFin}
Doctor: ${cita.doctorId?.username} ${cita.doctorId?.lastname || ''}
Mascota: ${nombreMascota}
Tipo de Cita: ${cita.tipoCita || 'Consulta general'}

Para confirmar o cancelar tu cita, visita tu panel en: ${FRONTEND_URL}/citas

(c) ${new Date().getFullYear()} Clínica Veterinaria.`;
  }

  // PASSWORD RESET EMAIL

  async sendResetPassword(toEmail, username, resetLink) {
    try {
      const subject = "Restablece tu Contraseña - Clínica Veterinaria";
      const html = this.getHtmlTemplate(username, resetLink);
      const text = this.getTextTemplate(username, resetLink);

      if (!sgMail) {
        throw new Error("SendGrid no está configurado");
      }

      const msg = {
        to: toEmail,
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: "Clínica Veterinaria",
        },
        subject: subject,
        html: html,
        text: text,
        trackingSettings: {
          clickTracking: { enable: false },
          openTracking: { enable: true },
        },
        category: "password-reset",
      };

      const response = await sgMail.send(msg);

      return {
        success: true,
        service: "sendgrid",
        messageId: response[0]?.headers?.["x-message-id"] || response[0]?.messageId,
      };
    } catch (error) {
      console.error("Error enviando correo:", error.message);
      if (error.response) {
        console.error("Detalles de SendGrid:", error.response.body);
      }
      throw error;
    }
  }

  getHtmlTemplate(username, resetLink) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #C0C0C0; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { background: #C0C0C0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .link-box { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Restablecer Contraseña</h1>
        </div>
        <div class="content">
            <h2>Hola ${username},</h2>
            <p>Has solicitado restablecer tu contraseña en <strong>Clínica Veterinaria</strong>.</p>
            <p>Para crear una nueva contraseña, haz clic en el botón de abajo:</p>
            
            <p style="text-align: center;">
                <a href="${resetLink}" class="button">Restablecer Contraseña</a>
            </p>
            
            <p><strong>Importante:</strong> Este enlace caducará en 1 hora.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
        <div class="footer">
            <p>(c) ${new Date().getFullYear()} Clínica Veterinaria. Todos los derechos reservados.</p>
            <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
    </div>
</body>
</html>`;
  }

  getTextTemplate(username, resetLink) {
    return `RESTABLECER CONTRASEÑA

Hola ${username},

Has solicitado restablecer tu contraseña en Clínica Veterinaria.

Para crear una nueva contraseña, haz clic en este enlace:
${resetLink}

Este enlace caducará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este correo.

(c) ${new Date().getFullYear()} Clínica Veterinaria.`;
  }

  // WELCOME EMAIL FOR REGULAR USERS

  async sendWelcomeEmail(toEmail, username, temporaryPassword) {
    try {
      const subject = "Bienvenido a El Éxito - Tu cuenta ha sido creada";
      const html = this.getWelcomeHtmlTemplate(username, toEmail, temporaryPassword);
      const text = this.getWelcomeTextTemplate(username, toEmail, temporaryPassword);

      if (!sgMail) {
        throw new Error("SendGrid no está configurado");
      }

      const msg = {
        to: toEmail,
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: "El Éxito - Clínica Veterinaria",
        },
        subject: subject,
        html: html,
        text: text,
        trackingSettings: {
          openTracking: { enable: true },
        },
        category: "welcome-email",
      };

      const response = await sgMail.send(msg);

      return {
        success: true,
        service: "sendgrid",
        messageId: response[0]?.headers?.["x-message-id"] || response[0]?.messageId,
      };
    } catch (error) {
      console.error("Error enviando correo de bienvenida:", error.message);
      if (error.response) {
        console.error("Detalles de SendGrid:", error.response.body);
      }
      throw error;
    }
  }

  // WELCOME EMAIL FOR DOCTORS

  async sendWelcomeEmailDoctor(toEmail, username, temporaryPassword) {
    try {
      const subject = "Bienvenido a El Éxito - Doctor";
      const html = this.getWelcomeDoctorHtmlTemplate(username, toEmail, temporaryPassword);
      const text = this.getWelcomeDoctorTextTemplate(username, toEmail, temporaryPassword);

      if (!sgMail) {
        throw new Error("SendGrid no está configurado");
      }

      const msg = {
        to: toEmail,
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: "El Éxito - Clínica Veterinaria",
        },
        subject: subject,
        html: html,
        text: text,
        trackingSettings: {
          openTracking: { enable: true },
        },
        category: "welcome-doctor",
      };

      const response = await sgMail.send(msg);

      return {
        success: true,
        service: "sendgrid",
        messageId: response[0]?.headers?.["x-message-id"] || response[0]?.messageId,
      };
    } catch (error) {
      console.error("Error enviando correo de bienvenida al doctor:", error.message);
      if (error.response) {
        console.error("Detalles de SendGrid:", error.response.body);
      }
      throw error;
    }
  }

  getWelcomeDoctorHtmlTemplate(username, email, temporaryPassword) {
    const plataformaUrl = "https://internal-platform.onrender.com";
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 20px; font-size: 48px; }
        .info-box { background: #f0f9ff; border-left: 4px solid #0891b2; padding: 15px 20px; margin: 20px 0; border-radius: 5px; }
        .password-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 20px 0; border-radius: 5px; }
        .password { font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #d97706; letter-spacing: 1px; }
        .button { display: inline-block; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 15px; margin: 20px 0; font-size: 13px; color: #dc2626; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">[Icono Doctor]</div>
            <h1>¡Bienvenido a El Éxito!</h1>
            <p>Clínica Veterinaria</p>
        </div>
        <div class="content">
            <h2>Dr. ${username},</h2>
            <p>Tu perfil de doctor ha sido creado exitosamente en nuestra plataforma de gestión veterinaria.</p>
            
            <div class="info-box">
                <strong>Tu usuario (correo):</strong> ${email}
            </div>
            
            <div class="password-box">
                <strong>Contraseña temporal:</strong><br>
                <span class="password">${temporaryPassword}</span>
            </div>
            
            <p>Por razones de seguridad, te recomendamos cambiar tu contraseña la primera vez que inicies sesión.</p>
            
            <div style="text-align: center;">
                <a href="${plataformaUrl}" class="button">Acceder a la Plataforma</a>
            </div>
            
            <div class="warning">
                <strong>Importante:</strong><br>
                - No compartas tu contraseña con nadie<br>
                - Cambia tu contraseña en tu primer acceso<br>
                - Si no solicitaste esta cuenta, ignora este mensaje
            </div>
        </div>
        <div class="footer">
            <p><strong>El Éxito - Clínica Veterinaria</strong></p>
            <p>(c) ${new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }

  getWelcomeDoctorTextTemplate(username, email, temporaryPassword) {
    const plataformaUrl = "https://internal-platform.onrender.com";
    
    return `
BIENVENIDO A EL ÉXITO - CLÍNICA VETERINARIA

Dr. ${username},

Tu perfil de doctor ha sido creado exitosamente.

-----------------------------------------
 USUARIO: ${email}
 CONTRASEÑA TEMPORAL: ${temporaryPassword}
-----------------------------------------

ACCEDER A LA PLATAFORMA: ${plataformaUrl}

RECOMENDACIONES:
- Cambia tu contraseña en tu primer acceso
- No compartas tu contraseña

(c) ${new Date().getFullYear()} El Éxito - Clínica Veterinaria
`;
  }

  getWelcomeHtmlTemplate(username, email, temporaryPassword) {
    const plataformaUrl = "https://internal-platform.onrender.com";
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .logo { text-align: center; margin-bottom: 20px; font-size: 48px; }
        .info-box { background: #f0f9ff; border-left: 4px solid #0891b2; padding: 15px 20px; margin: 20px 0; border-radius: 5px; }
        .password-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 20px 0; border-radius: 5px; }
        .password { font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #d97706; letter-spacing: 1px; }
        .button { display: inline-block; background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 15px; margin: 20px 0; font-size: 13px; color: #dc2626; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">[Icono Mascota]</div>
            <h1>¡Bienvenido a El Éxito!</h1>
            <p>Clínica Veterinaria</p>
        </div>
        <div class="content">
            <h2>Hola ${username},</h2>
            <p>Tu perfil ha sido creado exitosamente en nuestra plataforma.</p>
            
            <div class="info-box">
                <strong>Tu usuario (correo):</strong> ${email}
            </div>
            
            <div class="password-box">
                <strong>Contraseña temporal:</strong><br>
                <span class="password">${temporaryPassword}</span>
            </div>
            
            <p>Te recomendamos cambiar tu contraseña la primera vez que inicies sesión.</p>
            
            <div style="text-align: center;">
                <a href="${plataformaUrl}" class="button">Acceder a la Plataforma</a>
            </div>
            
            <div class="warning">
                <strong>Importante:</strong><br>
                - No compartas tu contraseña<br>
                - Cambia tu contraseña en tu primer acceso<br>
                - Si no solicitaste esta cuenta, ignora este mensaje
            </div>
        </div>
        <div class="footer">
            <p><strong>El Éxito - Clínica Veterinaria</strong></p>
            <p>(c) ${new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
  }

  getWelcomeTextTemplate(username, email, temporaryPassword) {
    const plataformaUrl = "https://internal-platform.onrender.com";
    
    return `
BIENVENIDO A EL ÉXITO - CLÍNICA VETERINARIA

Hola ${username},

Tu perfil ha sido creado exitosamente.

-----------------------------------------
 USUARIO: ${email}
 CONTRASEÑA TEMPORAL: ${temporaryPassword}
-----------------------------------------

ACCEDER: ${plataformaUrl}

Te recomendamos cambiar tu contraseña en tu primer acceso.

(c) ${new Date().getFullYear()} El Éxito - Clínica Veterinaria
`;
  }
}

// SECTION: INSTANCE EXPORTS

const emailService = new EmailService();

// SECTION: PUBLIC FUNCTIONS

export const sendResetPasswordEmail = async (email) => {
  console.log("[sendResetPasswordEmail] INICIO para:", email);
  let resetToken, resetLink, user;

  try {
    // Search in User collection first
    console.log("Buscando en User...");
    user = await User.findOne({ email });
    
    // If not found in User, search in Owner
    if (!user) {
      console.log("No encontrado en User, buscando en Owner...");
      user = await Owner.findOne({ email });
    }
    
    if (!user) {
      console.log("Usuario no encontrado");
      return {
        success: true,
        message: "Si el correo existe, recibirás un enlace para restablecer tu contraseña.",
      };
    }
    
    console.log("Usuario encontrado:", user.email);

    resetToken = await createAccessToken({ id: user._id }, "1h");
    resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const emailResult = await emailService.sendResetPassword(
      email,
      user.username,
      resetLink
    );

    return {
      success: true,
      message: "Se ha enviado un correo con instrucciones para restablecer tu contraseña.",
    };
  } catch (error) {
    console.error("Error en sendResetPasswordEmail:", error);
    return {
      success: false,
      message: "Hubo un error al procesar tu solicitud.",
    };
  }
};

export const checkEmailConfig = async () => {
  try {
    const config = {
      service: "sendgrid",
      nodeEnv: NODE_ENV,
      frontendUrl: FRONTEND_URL,
      isProduction: NODE_ENV === "production",
      timestamp: new Date().toISOString(),
      sendgrid: {
        apiKeyConfigured: !!SENDGRID_API_KEY,
        apiKeyLength: SENDGRID_API_KEY?.length || 0,
        fromEmail: SENDGRID_FROM_EMAIL || "no configurado",
        status: SENDGRID_API_KEY ? "CONFIGURADO" : "NO CONFIGURADO",
      },
    };

    return {
      success: true,
      ...config,
      message: "Configuración de SendGrid verificada exitosamente",
    };
  } catch (error) {
    console.error("Error verificando configuración:", error);
    return {
      success: false,
      message: "Error verificando la configuración de SendGrid",
      error: error.message,
    };
  }
};

export const sendAppointmentConfirmationEmail = async (email, nombreCliente, cita) => {
  try {
    const result = await emailService.sendAppointmentConfirmation(email, nombreCliente, cita);
    return result;
  } catch (error) {
    console.error("Error en sendAppointmentConfirmationEmail:", error);
    return {
      success: false,
      message: "Error enviando correo de confirmación",
    };
  }
};

export const sendWelcomeEmail = async (email, username, temporaryPassword) => {
  try {
    const result = await emailService.sendWelcomeEmail(email, username, temporaryPassword);
    return result;
  } catch (error) {
    console.error("Error en sendWelcomeEmail:", error);
    return {
      success: false,
      message: "Error enviando correo de bienvenida",
    };
  }
};

export const sendWelcomeEmailDoctor = async (email, username, temporaryPassword) => {
  try {
    const result = await emailService.sendWelcomeEmailDoctor(email, username, temporaryPassword);
    return result;
  } catch (error) {
    console.error("Error en sendWelcomeEmailDoctor:", error);
    return {
      success: false,
      message: "Error enviando correo de bienvenida al doctor",
    };
  }
};

export const sendAppointmentReminderEmail = async (email, nombreCliente, cita) => {
  const fecha = new Date(cita.fecha).toLocaleDateString('es-CR');
  const html = `
    <h1>Recordatorio de cita</h1>
    <p>Hola ${nombreCliente},</p>
    <p>Te recordamos que tienes una cita en 2 horas.</p>
    <p><strong>Fecha:</strong> ${fecha}</p>
    <p><strong>Hora:</strong> ${cita.horaInicio} - ${cita.horaFin}</p>
    <p><strong>Veterinario:</strong> ${cita.doctorId?.username}</p>
  `;
  
  const msg = { to: email, from: SENDGRID_FROM_EMAIL, subject: "Recordatorio de cita", html };
  await sgMail.send(msg);
};