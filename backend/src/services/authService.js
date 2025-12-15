import { createAccessToken } from '../libs/jwt.js';
import {EMAIL_USER, EMAIL_PASS, FRONTEND_URL, NODE_ENV} from '../config.js';
import nodemailer from 'nodemailer';
import User from '../models/user.model.js';

let transporter;

// Verificar credenciales de email
if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❌ ERROR: EMAIL_USER o EMAIL_PASS no están configurados');
    if (NODE_ENV === 'production') {
        console.error('⚠️ En producción, configura EMAIL_USER y EMAIL_PASS en Render');
    }
}

// Configurar transporter (igual para ambos entornos con Gmail)
transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

console.log(`📧 Transporter configurado para ${NODE_ENV === 'production' ? 'PRODUCCIÓN' : 'DESARROLLO'}`);

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
        console.log('📧 EMAIL_USER configurado?:', EMAIL_USER ? '✅ SÍ' : '❌ NO');
        console.log('📧 EMAIL_PASS configurado?:', EMAIL_PASS ? '✅ SÍ' : '❌ NO');
        // 1. Buscar usuario
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
        
        // 5. Verificar si tenemos credenciales para enviar email
        if (!EMAIL_USER || !EMAIL_PASS) {
            console.log('⚠️ Credenciales de email no configuradas');
              console.log('❌ ERROR: Credenciales de email NO configuradas en Render');
            console.log('   Agrega en Render:');
            console.log('   EMAIL_USER=tu_email@gmail.com');
            console.log('   EMAIL_PASS=app_password_de_16_caracteres');
            return {
                success: true,
                resetToken: resetToken,
                resetLink: resetLink,
                message: 'Token generated but email not sent (credentials missing)'
            };
        }
        
        // 6. Enviar email
        console.log('📤 Enviando email a:', email);
        
        await transporter.sendMail({
            from: `"Clinica Veterinaria" <${EMAIL_USER}>`, // FIJATE: Usa EMAIL_USER, NO process.env.EMAIL_USER
            to: email,
            subject: 'Restablece tu Contraseña - Clinica Veterinaria',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #06b6d4; margin: 0;">🔐 Restablecer Contraseña</h2>
                    </div>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">
                        Hola <strong style="color: #06b6d4;">${user.username}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Clinica Veterinaria</strong>.
                    </p>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">
                        Haz clic en el siguiente botón para crear una nueva contraseña:
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetLink}" 
                           style="background-color: #06b6d4; color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 8px; font-size: 16px; 
                                  font-weight: bold; display: inline-block; border: none;
                                  box-shadow: 0 4px 6px rgba(6, 182, 212, 0.3);">
                            🗝️ Crear Nueva Contraseña
                        </a>
                    </div>
                    
                    <div style="background-color: #f8fdff; padding: 15px; border-radius: 8px; border-left: 4px solid #06b6d4; margin: 20px 0;">
                        <p style="margin: 0; color: #666; font-size: 14px;">
                            <strong>⚠️ Importante:</strong> Este enlace expirará en <strong>1 hora</strong> por seguridad.
                        </p>
                    </div>
                    
                    <p style="font-size: 14px; color: #666; line-height: 1.5;">
                        Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura. 
                        Tu cuenta permanecerá protegida.
                    </p>
                </div>
            `
        });

        console.log('✅ Email enviado exitosamente');
        
        return {
            success: true,
            message: 'Password reset email sent successfully',
            resetToken: resetToken,
            resetLink: resetLink
        };

    } catch (error) {
        console.error('❌ Error en sendResetPasswordEmail:', error);
        
        // Si ya habíamos generado el token, lo devolvemos aunque falle el email
        if (resetToken) {
            console.log('⚠️ Email falló, pero token fue generado');
            return {
                success: true,
                resetToken: resetToken,
                resetLink: resetLink || `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`,
                message: `Token generated but email failed: ${error.message}`
            };
        }
        
        return {
            success: false,
            message: 'Failed to send password reset email: ' + error.message
        };
    }
}

export { transporter };