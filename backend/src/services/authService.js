import { createAccessToken } from '../libs/jwt.js';
import {EMAIL_USER, EMAIL_PASS, FRONTEND_URL, NODE_ENV} from '../config.js';
import nodemailer from 'nodemailer';
import User from '../models/user.model.js';


export const sendResetPasswordEmail = async (email) => {
    // Variables declaradas con let para poder asignarlas
    let resetToken;
    let resetLink;
    let user;

    try {
          console.log('='.repeat(50));
        console.log('📧 INICIANDO ENVÍO DE EMAIL');
        console.log('📧 Entorno:', NODE_ENV);
        console.log('📧 Email destino:', email);
        console.log('📧 EMAIL_USER:', EMAIL_USER || '❌ NO CONFIGURADO');
        console.log('📧 EMAIL_PASS:', EMAIL_PASS ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO');
        
  // 1. Verificar credenciales PRIMERO
        if (!EMAIL_USER || !EMAIL_PASS) {
            console.log('❌ ERROR: Credenciales de email faltantes');
            throw new Error('Email credentials not configured in Render');
        }

        user = await User.findOne({ email: email });
        if (!user) {
            console.log('⚠️ No se encontró usuario con ese email:', email);
            return {
                success: true,
                message: 'If an account with that email exists, we have sent a password reset link'
            };
        }   
        
        // 2. Crear token - IMPORTANTE: NO usar "const" aquí
        resetToken = await createAccessToken(
            { 
                id: user._id, 
                email: user.email,
                type: 'password_reset'
            },
            '1h'
        );
        
        // 3. Guardar en la base de datos
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();
        
        console.log('✅ Token creado para:', user.email);
        
        // 4. Crear enlace de reset
        resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
        console.log('🔗 Enlace generado:', resetLink);
        
     // 6. CREAR TRANSPORTER DENTRO DE LA FUNCIÓN (IMPORTANTE)
        console.log('🔄 Creando transporter con Gmail...');
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        // 7. Verificar conexión
        console.log('🔄 Verificando conexión SMTP...');
        await transporter.verify();
        console.log('✅ Conexión SMTP verificada');
        
        // 6. Enviar email
        console.log('📤 Enviando email a:', email);
        
          const mailOptions = {
            from: `"Clinica Veterinaria" <${EMAIL_USER}>`,
            to: email,
            subject: 'Restablece tu Contraseña - Clinica Veterinaria',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #06b6d4;">🔐 Restablecer Contraseña</h2>
                    <p>Hola <strong>${user.username}</strong>,</p>
                    <p>Haz clic aquí para resetear:</p>
                    <a href="${resetLink}" style="background-color: #06b6d4; color: white; padding: 10px 20px;">
                        🗝️ Crear Nueva Contraseña
                    </a>
                    <p><small>Enlace: ${resetLink}</small></p>
                </div>
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ ¡EMAIL ENVIADO EXITOSAMENTE!');
        console.log('✅ Message ID:', info.messageId);

        
        return {
            success: true,
            message: 'Password reset email sent successfully',
            resetToken: resetToken,
            resetLink: resetLink
        };

    } catch (error) {
               console.error('❌ ERROR en sendResetPasswordEmail:');
        console.error('❌ Código:', error.code);
        console.error('❌ Mensaje:', error.message);
        console.error('❌ Stack:', error.stack);
        // Si ya habíamos generado el token, lo devolvemos aunque falle el email
        if (resetToken) {
           
            return {
                 success: false,
                resetToken: resetToken,
                resetLink: resetLink,
                message: `Token generated but email failed: ${error.message}`
            };
        }
        
        return {
            success: false,
            message: 'Failed to send password reset email: ' + error.message
        };
    }
}

