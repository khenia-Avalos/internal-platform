import { createAccessToken } from '../libs/jwt.js';
import { EMAIL_USER, EMAIL_PASS, FRONTEND_URL } from '../config.js'; // Solo lo necesario
import nodemailer from 'nodemailer';
import User from '../models/user.model.js';

export const sendResetPasswordEmail = async (email) => {
    let resetToken;
    let resetLink;
    let user;

    try {
        console.log('='.repeat(50));
        console.log('📧 ENVÍO DE EMAIL CON GMAIL');
        console.log('📧 Email destino:', email);
        console.log('📧 EMAIL_USER:', EMAIL_USER || '❌ NO CONFIGURADO');
        console.log('📧 EMAIL_PASS:', EMAIL_PASS ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO');
        
        // 1. Verificar credenciales PRIMERO
        if (!EMAIL_USER || !EMAIL_PASS) {
            console.log('❌ ERROR: Configura EMAIL_USER y EMAIL_PASS en Render');
            throw new Error('Email credentials not configured in Render');
        }

        // 2. Buscar usuario
        user = await User.findOne({ email: email });
        if (!user) {
            console.log('⚠️ Usuario no encontrado (seguridad)');
            return {
                success: true,
                message: 'If an account exists with that email, we have sent a password reset link'
            };
        }   
        
        // 3. Crear token
        resetToken = await createAccessToken(
            { 
                id: user._id, 
                email: user.email,
                type: 'password_reset'
            },
            '1h'
        );
        
        // 4. Guardar en la base de datos
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        
        console.log('✅ Token creado para:', user.email);
        
        // 5. Crear enlace de reset
        resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
        console.log('🔗 Enlace generado:', resetLink);
        
        // 6. CONFIGURACIÓN GMAIL QUE SÍ FUNCIONA
        console.log('🔄 Configurando Gmail...');
        
        // Opción A: Configuración SIMPLE (la que más funciona)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            }
        });
        
        // Opción B: CON ESTO SI FALLA LA ANTERIOR (descomenta)
        /*
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true para 465, false para otros
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        */
        
        console.log('🔄 Verificando conexión Gmail...');
        
        // Verificar con timeout para que no se cuelgue
        try {
            await Promise.race([
                transporter.verify(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Gmail timeout (10s)')), 10000)
                )
            ]);
            console.log('✅ Conexión Gmail verificada');
        } catch (verifyError) {
            console.error('❌ Error verificando Gmail:', verifyError.message);
            
            // Si falla la verificación, aún intentamos enviar
            console.log('⚠️ Continuando aunque falló verificación...');
        }
        
        // 7. Enviar email
        console.log('📤 Enviando email...');
        
        const mailOptions = {
            from: `"Clinica Veterinaria" <${EMAIL_USER}>`,
            to: email,
            subject: 'Restablece tu Contraseña - Clinica Veterinaria',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #06b6d4; margin-bottom: 20px;">🔐 Restablecer Contraseña</h2>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">
                        Hola <strong style="color: #06b6d4;">${user.username}</strong>,
                    </p>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.5;">
                        Haz clic en el siguiente botón para crear una nueva contraseña:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" 
                           style="background-color: #06b6d4; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 6px; font-size: 16px; 
                                  font-weight: bold; display: inline-block;">
                            🗝️ Crear Nueva Contraseña
                        </a>
                    </div>
                    
                    <p style="color: #666; font-size: 14px;">
                        <strong>Enlace directo:</strong><br>
                        <code style="background: #f5f5f5; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 5px;">
                            ${resetLink}
                        </code>
                    </p>
                    
                    <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                        Si no solicitaste este cambio, puedes ignorar este mensaje.
                    </p>
                </div>
            `,
            // También agregar versión texto por si acaso
            text: `Hola ${user.username},\n\nPara restablecer tu contraseña, haz clic aquí:\n${resetLink}\n\nSi no solicitaste esto, ignora este mensaje.`
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ ¡EMAIL ENVIADO EXITOSAMENTE!');
        console.log('✅ Message ID:', info.messageId);
        console.log('✅ Respuesta Gmail:', info.response?.substring(0, 100) || 'Sin respuesta');

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
        
        // Diagnóstico automático
        if (error.code === 'EAUTH') {
            console.log('⚠️ DIAGNÓSTICO: Error de autenticación Gmail');
            console.log('   SOLUCIÓN: Crea App Password en https://myaccount.google.com/apppasswords');
            console.log('   La App Password debe tener 16 caracteres (ej: wyvpcitugiwgvnjb)');
        }
        
        if (error.message.includes('Timeout')) {
            console.log('⚠️ DIAGNÓSTICO: Gmail no responde desde Render');
            console.log('   POSIBLE SOLUCIÓN: Usa la Opción B de configuración (host/port)');
        }
        
        if (error.code === 'ECONNECTION') {
            console.log('⚠️ DIAGNÓSTICO: Render bloqueando conexión a Gmail');
            console.log('   SOLUCIÓN TEMPORAL: Mostrar enlace en pantalla');
        }
        
        // Si ya habíamos generado el token, lo devolvemos
        if (resetToken) {
            console.log('⚠️ Email falló, pero token fue generado');
            return {
                success: true,
                resetToken: resetToken,
                resetLink: resetLink || `${FRONTEND_URL || 'https://frontend-internal-platform.onrender.com'}/reset-password?token=${encodeURIComponent(resetToken)}`,
                message: `Token generated but email failed: ${error.message}`
            };
        }
        
        return {
            success: false,
            message: 'Failed to send password reset email: ' + error.message
        };
    }
}