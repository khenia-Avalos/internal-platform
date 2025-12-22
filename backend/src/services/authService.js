import { createAccessToken } from "../libs/jwt.js";
import {
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
  FRONTEND_URL,
  NODE_ENV,
} from "../config.js";
import User from "../models/user.model.js";

let sgMail;

// Configura SendGrid una sola vez
try {
  sgMail = (await import("@sendgrid/mail")).default;
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("✅ SendGrid configurado");
} catch (error) {
  console.error("❌ Error configurando SendGrid:", error.message);
  throw new Error("SendGrid no se pudo configurar");
}

class EmailService {
  async sendResetPassword(toEmail, username, resetLink) {
    //busca usuario en bd
    try {
      const subject = "Restablece tu Contraseña - Clínica Veterinaria";
      const html = this.getHtmlTemplate(username, resetLink);
      const text = this.getTextTemplate(username, resetLink);

      // Verifica que SendGrid esté configurado
      if (!sgMail) {
        throw new Error("SendGrid no está configurado");
      }

      // Envía directamente con SendGrid
      const msg = {
        to: toEmail,
        from: {
          email: SENDGRID_FROM_EMAIL ,
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

      const response = await sgMail.send(msg); //llama a la api de sendgrid

      return {
        success: true,
        service: "sendgrid",
        messageId:
          response[0]?.headers?.["x-message-id"] || response[0]?.messageId,
        // Esta línea intenta obtener el ID del mensaje de dos lugares posibles donde SendGrid podría guardarlo, usando optional chaining para evitar errores si alguna propiedad no existe.
      };
    } catch (error) {
      console.error(" Error enviando email:", error.message);
      if (error.response) {
        console.error("Detalles SendGrid:", error.response.body);
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
            <h1> Restablecer Contraseña</h1>
        </div>
        <div class="content">
            <h2>Hola ${username},</h2>
            <p>Has solicitado restablecer tu contraseña en <strong>Clínica Veterinaria</strong>.</p>
            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
            
            <p style="text-align: center;">
                <a href="${resetLink}" class="button">Restablecer Contraseña</a>
            </p>
            
            
            <p><strong> Importante:</strong> Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Clínica Veterinaria. Todos los derechos reservados.</p>
            <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
    </div>
</body>
</html>`;
  }

  getTextTemplate(username, resetLink) {
    return `RESTABLECIMIENTO DE CONTRASEÑA

Hola ${username},

Has solicitado restablecer tu contraseña en Clínica Veterinaria.

Para crear una nueva contraseña, haz clic en este enlace:
${resetLink}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este email.

© ${new Date().getFullYear()} Clínica Veterinaria.`;
  }
}

const emailService = new EmailService();

export const sendResetPasswordEmail = async (email) => {
  let resetToken, resetLink, user;

  try {
    user = await User.findOne({ email });
    if (!user) {
      return {
        success: true,//por seguridad 
        message:
          "Si el email existe, recibirás un enlace para restablecer tu contraseña.",
      };
    }

    resetToken = await createAccessToken({ id: user._id }, "1h");
    resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(
      resetToken
    )}`;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    const emailResult = await emailService.sendResetPassword(
      email,
      user.username,//llama al metodo del servicio de email
      resetLink
    );

    const response = {
      success: true,
      message:
        "Se ha enviado un email con las instrucciones para restablecer tu contraseña.",
    };


    return response;
  } catch (error) {
    console.error("Error in reset password email:", error);

    // En desarrollo, puedes mostrar más información
    if (NODE_ENV === "development") {
      return {
        success: false,
        message: "Error enviando el email",
        error: error.message,
        ...(resetLink && { resetLink: resetLink }),
      };
    }

    // En producción
    return {
      success: false,
      message:
        "Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.",
    };
  }
};

export const checkEmailConfig = async () => {//codigo para debug 
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
        status: SENDGRID_API_KEY ? "✅ CONFIGURADO" : "❌ NO CONFIGURADO",
      },
    };

    return {
      success: true,
      ...config,
      message: "Configuración de SendGrid verificada correctamente",
    };
  } catch (error) {
    console.error("Error verificando configuración:", error);
    return {
      success: false,
      message: "Error verificando configuración de SendGrid",
      error: error.message,
    };
  }
};
