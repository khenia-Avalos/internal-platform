import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';
import User from '../models/user.model.js'; // ✅ Importa el modelo User

export const sendResetPasswordEmail = async (email) => {
    try {
        // Buscar usuario - corrección de la sintaxis
        const user = await User.findOne({ email: email }); // ✅ Usa findOne en lugar de find
        if (!user) {
            // Por seguridad, no revelar que el usuario no existe
            console.log(`Password reset requested for non-existent email: ${email}`);
            return {
                success: true, // ✅ Devuelve success true por seguridad
                message: 'If an account with that email exists, we have sent a password reset link'
            };
        }   
        
        // Generar token JWT
        const resetToken = jwt.sign({ 
            id: user._id, 
            email: user.email,
            type: 'password_reset' // ✅ Agrega tipo para diferenciar
        }, TOKEN_SECRET, { expiresIn: '1h' });
        
        // Guardar token en el usuario
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();
        
        console.log('📧 ===== PASSWORD RESET EMAIL =====');
        console.log(`To: ${email}`);
        console.log(`Reset Link: ${resetToken}`);
        console.log('📧 ================================');
        
        return {
            success: true,
            message: 'If an account with that email exists, we have sent a password reset link',
            resetToken: resetToken, // Para desarrollo
resetLink : `http://localhost:5173/reset-password?token=${encodeURIComponent(resetToken)}`

        }

    } catch (error) {
        console.error('Error sending reset password email:', error);
        return {
            success: false,
            message: 'Failed to send password reset email'
        };
    }
}


