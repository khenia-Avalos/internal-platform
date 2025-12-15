import { createAccessToken } from '../libs/jwt.js';
import { 
    EMAIL_SERVICE, 
    EMAIL_USER, 
    EMAIL_PASS, 
    SENDGRID_API_KEY, 
    SENDGRID_FROM_EMAIL,
    FRONTEND_URL,
    NODE_ENV
} from '../config.js';
import nodemailer from 'nodemailer';
import User from '../models/user.model.js';

// Importar SendGrid solo si se va a usar
let sgMail;
if (EMAIL_SERVICE === 'sendgrid' && SENDGRID_API_KEY) {
    try {
        sgMail = (await import('@sendgrid/mail')).default;
        sgMail.setApiKey(SENDGRID_API_KEY);
        console.log('✅ SendGrid inicializado correctamente');
    } catch (error) {
        console.error('❌ Error cargando SendGrid:', error.message);
    }
}

/**
 * Servicio unificado para enviar emails
 */
class EmailService {
    /**
     * Enviar email de restablecimiento de contraseña
     */
    async sendResetPassword(toEmail, username, resetLink) {
        try {
            console.log(`📧 Enviando a: ${toEmail} (servicio: ${EMAIL_SERVICE})`);
            
            const subject = 'Restablece tu Contraseña - Clínica Veterinaria';
            const html = this.getHtmlTemplate(username, resetLink);
            const text = this.getTextTemplate(username, resetLink);
            
            // Seleccionar método según configuración
            switch (EMAIL_SERVICE) {
                case 'sendgrid':
                    if (!sgMail) throw new Error('SendGrid no configurado');
                    return await this.sendWithSendGrid(toEmail, subject, html, text);
                
                case 'gmail':
                    return await this.sendWithGmail(toEmail, subject, html, text);
                
                default:
                    return await this.sendWithEthereal(toEmail, subject, html, text);
            }
            
        } catch (error) {
            console.error('❌ Error enviando email:', error.message);
            throw error;
        }
    }
    
    /**
     * Enviar con SendGrid
     */
    async sendWithSendGrid(toEmail, subject, html, text) {
        const fromEmail = SENDGRID_FROM_EMAIL || EMAIL_USER || 'noreply@clinicaveterinaria.com';
        
        const msg = {
            to: toEmail,
            from: {
                email: fromEmail,
                name: 'Clínica Veterinaria'
            },
            subject: subject,
            html: html,
            text: text
        };
        
        const response = await sgMail.send(msg);
        console.log('✅ Email enviado con SendGrid');
        console.log('📧 Status:', response[0].statusCode);
        
        return {
            success: true,
            service: 'sendgrid',
            messageId: response[0].headers?.['x-message-id']
        };
    }
    
    /**
     * Enviar con Gmail
     */
    async sendWithGmail(toEmail, subject, html, text) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
            // Timeout más largo para Render
            connectionTimeout: 30000,
            socketTimeout: 30000,
            greetingTimeout: 30000
        });
        
        const mailOptions = {
            from: `"Clínica Veterinaria" <${EMAIL_USER}>`,
            to: toEmail,
            subject: subject,
            html: html,
            text: text,
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado con Gmail');
        console.log('📧 Message ID:', info.messageId);
        
        return {
            success: true,
            service: 'gmail',
            messageId: info.messageId
        };
    }
    
    /**
     * Enviar con Ethereal (para desarrollo)
     */
    async sendWithEthereal(toEmail, subject, html, text) {
        // Crear cuenta de prueba automáticamente
        let testAccount;
        try {
            testAccount = await nodemailer.createTestAccount();
            console.log('🌐 Cuenta Ethereal creada:', testAccount.user);
        } catch (error) {
            console.error('❌ Error creando cuenta Ethereal:', error.message);
            // Fallback: simular envío en desarrollo
            return this.simulateEmail(toEmail, username, resetLink);
        }
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        
        const mailOptions = {
            from: `"Clínica Veterinaria" <${testAccount.user}>`,
            to: toEmail,
            subject: subject,
            html: html,
            text: text,
        };
        
        const info = await transporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        
        console.log('✅ Email enviado con Ethereal');
        console.log('📧 Preview URL:', previewUrl);
        
        return {
            success: true,
            service: 'ethereal',
            previewUrl: previewUrl
        };
    }
    
    /**
     * Simular envío de email (para cuando todo falla)
     */
    simulateEmail(toEmail, username, resetLink) {
        console.log('🔧 SIMULANDO envío de email (modo desarrollo)');
        console.log('📧 Para:', toEmail);
        console.log('👤 Usuario:', username);
        console.log('🔗 Enlace:', resetLink);
        
        return {
            success: true,
            service: 'simulated',
            simulated: true,
            resetLink: resetLink
        };
    }
    
    /**
     * Template HTML profesional
     */
    getHtmlTemplate(username, resetLink) {
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
        .button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .link-box { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; word-break: break-all; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Restablecer Contraseña</h1>
        </div>
        <div class="content">
            <h2>Hola ${username},</h2>
            <p>Has solicitado restablecer tu contraseña en <strong>Clínica Veterinaria</strong>.</p>
            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
            
            <p style="text-align: center;">
                <a href="${resetLink}" class="button">Restablecer Contraseña</a>
            </p>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <div class="link-box">${resetLink}</div>
            
            <p><strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora.</p>
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
    
    /**
     * Template texto plano
     */
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

// Crear instancia única
const emailService = new EmailService();

/**
 * Función principal - REEMPLAZA TU FUNCIÓN EXISTENTE
 */
export const sendResetPasswordEmail = async (email) => {
    console.log('='.repeat(50));
    console.log('🔥 SENDGRID SOLUCIÓN - TODO EN UNO');
    console.log('📧 Para:', email);
    console.log('🔧 Servicio configurado:', EMAIL_SERVICE);
    
    let resetToken, resetLink, user;
    
    try {
        // 1. Buscar usuario
        user = await User.findOne({ email });
        if (!user) {
            console.log('⚠️ Usuario no encontrado (no se enviará email)');
            // Por seguridad, siempre devolver éxito
            return { 
                success: true, 
                message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.' 
            };
        }
        
        console.log('✅ Usuario encontrado:', user.username);
        
        // 2. Crear token
        resetToken = await createAccessToken({ id: user._id }, '1h');
        resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
        
        console.log('✅ Token creado');
        console.log('🔗 Enlace generado');
        
        // 3. Guardar en base de datos
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();
        
        // 4. Enviar email
        console.log('🚀 Enviando email...');
        const emailResult = await emailService.sendResetPassword(
            email,
            user.username,
            resetLink
        );
        
        console.log('✅ Proceso completado exitosamente');
        console.log('📧 Servicio usado:', emailResult.service);
        
        // 5. Preparar respuesta
        const response = {
            success: true,
            message: 'Se ha enviado un email con las instrucciones para restablecer tu contraseña.'
        };
        
        // Información adicional para desarrollo
        if (NODE_ENV === 'development') {
            response.debug = {
                service: emailResult.service,
                resetLink: resetLink,
                ...(emailResult.previewUrl && { previewUrl: emailResult.previewUrl }),
                ...(emailResult.simulated && { simulated: true, note: 'Email simulado para desarrollo' })
            };
            
            if (emailResult.previewUrl) {
                console.log('🔗 Enlace para ver el email:', emailResult.previewUrl);
            }
            
            if (emailResult.simulated) {
                console.log('🔧 Email simulado. Enlace real:', resetLink);
            }
        }
        
        return response;
        
    } catch (error) {
        console.error('❌ ERROR CRÍTICO:', error.message);
        
        // Manejo específico de errores
        let userMessage = 'Error al procesar la solicitud';
        
        if (error.message.includes('SENDGRID_API_KEY') || error.message.includes('SendGrid no configurado')) {
            userMessage = 'El servicio de email no está configurado correctamente';
            console.log('🔧 SOLUCIÓN: Configura SENDGRID_API_KEY en Render');
        } else if (error.message.includes('Invalid login') || error.message.includes('Authentication failed')) {
            userMessage = 'Error de autenticación del servicio de email';
            console.log('🔧 SOLUCIÓN: Verifica EMAIL_USER y EMAIL_PASS');
        } else if (error.message.includes('Timeout')) {
            userMessage = 'El servicio está respondiendo lentamente. Intenta nuevamente.';
            console.log('🔧 SOLUCIÓN: Usa SendGrid en lugar de Gmail para producción');
        }
        
        // SIEMPRE devolver el enlace si tenemos token (aunque falle el email)
        if (resetToken && NODE_ENV === 'development') {
            console.log('🔧 Enviando enlace directamente (modo desarrollo)');
            return {
                success: true,
                message: `Email falló, pero aquí está tu enlace: ${resetLink}`,
                debug: {
                    error: error.message,
                    resetLink: resetLink,
                    note: 'Esto solo se muestra en desarrollo'
                }
            };
        }
        
        // En producción, mensaje genérico
        return { 
            success: false, 
            message: userMessage,
            ...(NODE_ENV === 'development' && { error: error.message })
        };
    }
};

/**
 * Función extra para verificar configuración
 */
export const checkEmailConfig = async () => {
    console.log('🔍 Verificando configuración de email...');
    
    try {
        const config = {
            service: EMAIL_SERVICE,
            nodeEnv: NODE_ENV,
            frontendUrl: FRONTEND_URL,
            isProduction: NODE_ENV === 'production',
            timestamp: new Date().toISOString()
        };
        
        if (EMAIL_SERVICE === 'sendgrid') {
            config.sendgrid = {
                apiKeyConfigured: !!SENDGRID_API_KEY,
                apiKeyLength: SENDGRID_API_KEY?.length || 0,
                fromEmail: SENDGRID_FROM_EMAIL,
                status: SENDGRID_API_KEY ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO'
            };
            
            if (SENDGRID_API_KEY) {
                config.sendgrid.test = 'SendGrid listo para usar';
            }
            
        } else if (EMAIL_SERVICE === 'gmail') {
            config.gmail = {
                user: EMAIL_USER ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO',
                pass: EMAIL_PASS ? `✅ CONFIGURADO (${EMAIL_PASS.length} chars)` : '❌ NO CONFIGURADO',
                note: EMAIL_PASS?.length !== 16 ? '⚠️ App Password debe tener 16 caracteres' : '✅ Longitud correcta'
            };
        } else {
            config.service = 'ethereal (desarrollo)';
        }
        
        console.log('✅ Configuración verificada:', config);
        return {
            success: true,
            ...config,
            message: 'Configuración verificada correctamente'
        };
        
    } catch (error) {
        console.error('❌ Error verificando configuración:', error);
        return { 
            success: false, 
            message: 'Error verificando configuración',
            error: error.message 
        };
    }
};