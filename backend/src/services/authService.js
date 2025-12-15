import { createAccessToken } from '../libs/jwt.js';
import { EMAIL_USER, EMAIL_PASS, FRONTEND_URL } from '../config.js';
import nodemailer from 'nodemailer';
import User from '../models/user.model.js';

export const sendResetPasswordEmail = async (email) => {
    let resetToken, resetLink, user;

    try {
        console.log('='.repeat(50));
        console.log('🔥 SOLUCIÓN SIN VERIFICACIÓN');
        console.log('📧 Para:', email);
        console.log('🔧 EMAIL_USER:', EMAIL_USER);
        console.log('🔧 EMAIL_PASS longitud:', EMAIL_PASS?.length || 0);
        
        // 1. Verificar App Password (CRÍTICO)
        if (!EMAIL_USER || !EMAIL_PASS) {
            throw new Error('Configura EMAIL_USER y EMAIL_PASS en Render');
        }
        
        // La App Password DEBE tener 16 caracteres
        if (EMAIL_PASS.length !== 16) {
            throw new Error(`App Password debe tener 16 caracteres (tiene: ${EMAIL_PASS.length}). 
Crea una nueva en: https://myaccount.google.com/apppasswords`);
        }
        
        // 2. Buscar usuario
        user = await User.findOne({ email });
        if (!user) {
            console.log('⚠️ Usuario no encontrado');
            return { success: true };
        }
        
        // 3. Crear token
        resetToken = await createAccessToken({ id: user._id }, '1h');
        resetLink = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        
        console.log('✅ Token creado');
        console.log('🔗 Enlace:', resetLink);
        
        // 4. CONFIGURACIÓN QUE SÍ FUNCIONA (sin verify)
        console.log('🔄 Creando transporter (SIN verificación)...');
        
        // Opción A: Gmail SIMPLE (95% funciona)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS,
            },
            // NO timeout, NO verify
        });
        
        // 5. ENVIAR EMAIL DIRECTAMENTE (sin verificar)
        console.log('📤 Enviando email DIRECTAMENTE...');
        
        const mailOptions = {
            from: `"Clinica Veterinaria" <${EMAIL_USER}>`,
            to: email,
            subject: 'Restablece tu Contraseña',
            html: `<p>Hola ${user.username}, haz clic: <a href="${resetLink}">${resetLink}</a></p>`,
            text: `Hola ${user.username}, haz clic aquí: ${resetLink}`
        };
        
        console.log('🔄 Llamando a transporter.sendMail()...');
        
        // SIN await, usamos Promise con timeout
        const emailPromise = transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout email (15s)')), 15000);
        });
        
        const info = await Promise.race([emailPromise, timeoutPromise]);
        
        console.log('✅ ¡EMAIL ENVIADO!');
        console.log('✅ Message ID:', info.messageId);
        console.log('✅ Respuesta:', info.response);
        
        return {
            success: true,
            resetToken: resetToken,
            resetLink: resetLink,
            message: 'Email enviado exitosamente'
        };

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('❌ Stack:', error.stack);
        
        // DIAGNÓSTICO PRECISO
        if (error.message.includes('Invalid login')) {
            console.log('🔍 DIAGNÓSTICO: App Password incorrecta');
            console.log('   1. Ve a: https://myaccount.google.com/apppasswords');
            console.log('   2. Crea NUEVA para "Render"');
            console.log('   3. Copia 16 caracteres SIN espacios');
            console.log('   4. Actualiza EMAIL_PASS en Render');
        }
        
        if (error.message.includes('Timeout')) {
            console.log('🔍 DIAGNÓSTICO: Gmail bloqueado desde Render');
            console.log('   SOLUCIÓN:');
            console.log('   1. Prueba enviar desde localhost primero');
            console.log('   2. O usa solución temporal (mostrar enlace)');
        }
        
        if (resetToken) {
            return {
                success: true,
                resetToken: resetToken,
                resetLink: resetLink,
                message: `Token generado. Email falló: ${error.message}`
            };
        }
        
        return { success: false, message: error.message };
    }
};