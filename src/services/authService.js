import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';
import nodemailer from 'nodemailer';
import User from '../models/user.model.js';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendResetPasswordEmail = async (email) => {
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return {
                success: true,
                message: 'If an account with that email exists, we have sent a password reset link'
            };
        }   
        
        const resetToken = jwt.sign({ 
            id: user._id, 
            email: user.email,
            type: 'password_reset'
        }, TOKEN_SECRET, { expiresIn: '1h' });
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        
        const resetLink = `http://localhost:5173/reset-password?token=${encodeURIComponent(resetToken)}`;

        // Enviar email con nuevo estilo
        await transporter.sendMail({
            from: `"Clinica Veterinaria" <${process.env.EMAIL_USER}>`,
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

        return {
            success: true,
            message: 'If an account with that email exists, we have sent a password reset link',
            resetToken: resetToken,
            resetLink: `http://localhost:5173/reset-password?token=${encodeURIComponent(resetToken)}`
        }

    } catch (error) {
        console.error('Error sending reset password email:', error);
        return {
            success: false,
            message: 'Failed to send password reset email'
        };
    }
}