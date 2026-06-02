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
  console.log("SendGrid configured");
} catch (error) {
  console.error("Error configuring SendGrid:", error.message);
  throw new Error("SendGrid could not be configured");
}

// SECTION: EMAIL SERVICE CLASS

class EmailService {
  
  // APPOINTMENT CONFIRMATION EMAIL
  
  async sendAppointmentConfirmation(toEmail, nombreCliente, cita) {
    try {
      const subject = "Appointment Confirmation - Veterinary Clinic";
      const html = this.getAppointmentHtmlTemplate(nombreCliente, cita);
      const text = this.getAppointmentTextTemplate(nombreCliente, cita);

      if (!sgMail) {
        throw new Error("SendGrid is not configured");
      }

      const msg = {
        to: toEmail,
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: "Veterinary Clinic",
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
      console.error("Error sending confirmation email:", error.message);
      if (error.response) {
        console.error("SendGrid details:", error.response.body);
      }
      throw error;
    }
  }

  getAppointmentHtmlTemplate(nombreCliente, cita) {
    const fecha = new Date(cita.fecha).toLocaleDateString('es-CR');
    const horaInicio = cita.horaInicio;
    const horaFin = cita.horaFin;
    
    let nombreMascota = 'Not specified';
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
            <h1>Appointment Confirmation</h1>
        </div>
        <div class="content">
            <h2>Hello ${nombreCliente},</h2>
            <p>Your appointment has been <strong>successfully scheduled</strong>.</p>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 10px; margin: 20px 0;">
                <p><strong>Date:</strong> ${fecha}</p>
                <p><strong>Time:</strong> ${horaInicio} - ${horaFin}</p>
                <p><strong>Doctor:</strong> ${cita.doctorId?.username} ${cita.doctorId?.lastname || ''}</p>
                <p><strong>Pet:</strong> ${nombreMascota}</p>
                <p><strong>Appointment Type:</strong> ${cita.tipoCita || 'General consultation'}</p>
            </div>
            
            <div class="actions">
                <a href="${confirmarUrl}" class="button">Confirm Appointment</a>
                <a href="${cancelarUrl}" class="button button-cancel">Cancel Appointment</a>
                <a href="${whatsappUrl}" class="button button-wa" target="_blank">Reschedule via WhatsApp</a>
            </div>
            
            <p><strong>Important:</strong> If you need to modify your appointment, you can use the buttons above.</p>
            <p><small>This link is personal and non-transferable. Expires in 7 days.</small></p>
        </div>
        <div class="footer">
            <p>(c) ${new Date().getFullYear()} Veterinary Clinic. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  getAppointmentTextTemplate(nombreCliente, cita) {
    const fecha = new Date(cita.fecha).toLocaleDateString('es-CR');
    
    let nombreMascota = 'Not specified';
    if (cita.pacienteId?.nombre) {
      nombreMascota = cita.pacienteId.nombre;
    } else if (cita.pacienteTemporal?.nombre) {
      nombreMascota = cita.pacienteTemporal.nombre;
    }
    
    return `APPOINTMENT CONFIRMATION

Hello ${nombreCliente},

Your appointment has been successfully scheduled.

Date: ${fecha}
Time: ${cita.horaInicio} - ${cita.horaFin}
Doctor: ${cita.doctorId?.username} ${cita.doctorId?.lastname || ''}
Pet: ${nombreMascota}
Appointment Type: ${cita.tipoCita || 'General consultation'}

To confirm or cancel your appointment, visit your panel at: ${FRONTEND_URL}/citas

(c) ${new Date().getFullYear()} Veterinary Clinic.`;
  }

  // PASSWORD RESET EMAIL

  async sendResetPassword(toEmail, username, resetLink) {
    try {
      const subject = "Reset Your Password - Veterinary Clinic";
      const html = this.getHtmlTemplate(username, resetLink);
      const text = this.getTextTemplate(username, resetLink);

      if (!sgMail) {
        throw new Error("SendGrid is not configured");
      }

      const msg = {
        to: toEmail,
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: "Veterinary Clinic",
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
      console.error("Error sending email:", error.message);
      if (error.response) {
        console.error("SendGrid details:", error.response.body);
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
            <h1>Reset Password</h1>
        </div>
        <div class="content">
            <h2>Hello ${username},</h2>
            <p>You have requested to reset your password at <strong>Veterinary Clinic</strong>.</p>
            <p>To create a new password, click the button below:</p>
            
            <p style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            
            <p><strong>Important:</strong> This link will expire in 1 hour.</p>
            <p>If you did not request this change, you can ignore this email.</p>
        </div>
        <div class="footer">
            <p>(c) ${new Date().getFullYear()} Veterinary Clinic. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`;
  }

  getTextTemplate(username, resetLink) {
    return `PASSWORD RESET

Hello ${username},

You have requested to reset your password at Veterinary Clinic.

To create a new password, click this link:
${resetLink}

This link will expire in 1 hour.

If you did not request this change, you can ignore this email.

(c) ${new Date().getFullYear()} Veterinary Clinic.`;
  }

  // WELCOME EMAIL FOR REGULAR USERS

  async sendWelcomeEmail(toEmail, username, temporaryPassword) {
    try {
      const subject = "Welcome to El Exito - Your account has been created";
      const html = this.getWelcomeHtmlTemplate(username, toEmail, temporaryPassword);
      const text = this.getWelcomeTextTemplate(username, toEmail, temporaryPassword);

      if (!sgMail) {
        throw new Error("SendGrid is not configured");
      }

      const msg = {
        to: toEmail,
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: "El Exito - Veterinary Clinic",
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
      console.error("Error sending welcome email:", error.message);
      if (error.response) {
        console.error("SendGrid details:", error.response.body);
      }
      throw error;
    }
  }

  // WELCOME EMAIL FOR DOCTORS

  async sendWelcomeEmailDoctor(toEmail, username, temporaryPassword) {
    try {
      const subject = "Welcome to El Exito - Doctor";
      const html = this.getWelcomeDoctorHtmlTemplate(username, toEmail, temporaryPassword);
      const text = this.getWelcomeDoctorTextTemplate(username, toEmail, temporaryPassword);

      if (!sgMail) {
        throw new Error("SendGrid is not configured");
      }

      const msg = {
        to: toEmail,
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: "El Exito - Veterinary Clinic",
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
      console.error("Error sending welcome email to doctor:", error.message);
      if (error.response) {
        console.error("SendGrid details:", error.response.body);
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
            <div class="logo">[Doctor Icon]</div>
            <h1>Welcome to El Exito!</h1>
            <p>Veterinary Clinic</p>
        </div>
        <div class="content">
            <h2>Dr. ${username},</h2>
            <p>Your doctor profile has been successfully created in our veterinary management platform.</p>
            
            <div class="info-box">
                <strong>Your username (email):</strong> ${email}
            </div>
            
            <div class="password-box">
                <strong>Temporary password:</strong><br>
                <span class="password">${temporaryPassword}</span>
            </div>
            
            <p>For security reasons, we recommend changing your password the first time you log in.</p>
            
            <div style="text-align: center;">
                <a href="${plataformaUrl}" class="button">Access the Platform</a>
            </div>
            
            <div class="warning">
                <strong>Important:</strong><br>
                - Do not share your password with anyone<br>
                - Change your password on first access<br>
                - If you did not request this account, please ignore this message
            </div>
        </div>
        <div class="footer">
            <p><strong>El Exito - Veterinary Clinic</strong></p>
            <p>(c) ${new Date().getFullYear()} All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  getWelcomeDoctorTextTemplate(username, email, temporaryPassword) {
    const plataformaUrl = "https://internal-platform.onrender.com";
    
    return `
WELCOME TO EL EXITO - VETERINARY CLINIC

Dr. ${username},

Your doctor profile has been successfully created.

-----------------------------------------
 USERNAME: ${email}
 TEMPORARY PASSWORD: ${temporaryPassword}
-----------------------------------------

ACCESS THE PLATFORM: ${plataformaUrl}

RECOMMENDATIONS:
- Change your password on first access
- Do not share your password

(c) ${new Date().getFullYear()} El Exito - Veterinary Clinic
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
            <div class="logo">[Pet Icon]</div>
            <h1>Welcome to El Exito!</h1>
            <p>Veterinary Clinic</p>
        </div>
        <div class="content">
            <h2>Hello ${username},</h2>
            <p>Your profile has been successfully created on our platform.</p>
            
            <div class="info-box">
                <strong>Your username (email):</strong> ${email}
            </div>
            
            <div class="password-box">
                <strong>Temporary password:</strong><br>
                <span class="password">${temporaryPassword}</span>
            </div>
            
            <p>We recommend changing your password the first time you log in.</p>
            
            <div style="text-align: center;">
                <a href="${plataformaUrl}" class="button">Access the Platform</a>
            </div>
            
            <div class="warning">
                <strong>Important:</strong><br>
                - Do not share your password<br>
                - Change your password on first access<br>
                - If you did not request this account, ignore this message
            </div>
        </div>
        <div class="footer">
            <p><strong>El Exito - Veterinary Clinic</strong></p>
            <p>(c) ${new Date().getFullYear()} All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  getWelcomeTextTemplate(username, email, temporaryPassword) {
    const plataformaUrl = "https://internal-platform.onrender.com";
    
    return `
WELCOME TO EL EXITO - VETERINARY CLINIC

Hello ${username},

Your profile has been successfully created.

-----------------------------------------
 USERNAME: ${email}
 TEMPORARY PASSWORD: ${temporaryPassword}
-----------------------------------------

ACCESS: ${plataformaUrl}

We recommend changing your password on first access.

(c) ${new Date().getFullYear()} El Exito - Veterinary Clinic
`;
  }
}

// SECTION: INSTANCE EXPORTS

const emailService = new EmailService();

// SECTION: PUBLIC FUNCTIONS

export const sendResetPasswordEmail = async (email) => {
  console.log("[sendResetPasswordEmail] START for:", email);
  let resetToken, resetLink, user;

  try {
    // Search in User collection first
    console.log("Searching in User...");
    user = await User.findOne({ email });
    
    // If not found in User, search in Owner
    if (!user) {
      console.log("Not found in User, searching in Owner...");
      user = await Owner.findOne({ email });
    }
    
    if (!user) {
      console.log("User not found");
      return {
        success: true,
        message: "If the email exists, you will receive a link to reset your password.",
      };
    }
    
    console.log("User found:", user.email);

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
      message: "An email with instructions to reset your password has been sent.",
    };
  } catch (error) {
    console.error("Error in sendResetPasswordEmail:", error);
    return {
      success: false,
      message: "There was an error processing your request.",
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
        fromEmail: SENDGRID_FROM_EMAIL || "not configured",
        status: SENDGRID_API_KEY ? "CONFIGURED" : "NOT CONFIGURED",
      },
    };

    return {
      success: true,
      ...config,
      message: "SendGrid configuration verified successfully",
    };
  } catch (error) {
    console.error("Error verifying configuration:", error);
    return {
      success: false,
      message: "Error verifying SendGrid configuration",
      error: error.message,
    };
  }
};

export const sendAppointmentConfirmationEmail = async (email, nombreCliente, cita) => {
  try {
    const result = await emailService.sendAppointmentConfirmation(email, nombreCliente, cita);
    return result;
  } catch (error) {
    console.error("Error in sendAppointmentConfirmationEmail:", error);
    return {
      success: false,
      message: "Error sending confirmation email",
    };
  }
};

export const sendWelcomeEmail = async (email, username, temporaryPassword) => {
  try {
    const result = await emailService.sendWelcomeEmail(email, username, temporaryPassword);
    return result;
  } catch (error) {
    console.error("Error in sendWelcomeEmail:", error);
    return {
      success: false,
      message: "Error sending welcome email",
    };
  }
};

export const sendWelcomeEmailDoctor = async (email, username, temporaryPassword) => {
  try {
    const result = await emailService.sendWelcomeEmailDoctor(email, username, temporaryPassword);
    return result;
  } catch (error) {
    console.error("Error in sendWelcomeEmailDoctor:", error);
    return {
      success: false,
      message: "Error sending welcome email to doctor",
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