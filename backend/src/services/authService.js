export const sendResetPasswordEmail = async (email) => {
    let resetToken, resetLink, user;

    try {
        console.log('='.repeat(50));
        console.log('📧 SOLUCIÓN DIRECTA - Gmail');
        
        // 1. Verificar App Password
        if (!process.env.EMAIL_PASS) {
            console.log('❌ ERROR: No hay EMAIL_PASS en Render');
            throw new Error('Configura EMAIL_PASS en Render con App Password de 16 caracteres');
        }
        
        // 2. Crear token (simple y directo)
        user = await User.findOne({ email });
        if (!user) {
            console.log('⚠️ Usuario no encontrado (seguridad)');
            return { success: true };
        }
        
        resetToken = await createAccessToken({ id: user._id }, '1h');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        
        resetLink = `https://frontend-internal-platform.onrender.com/reset-password?token=${encodeURIComponent(resetToken)}`;
        console.log('✅ Token creado');
        console.log('🔗 Enlace:', resetLink);
        
        // 3. ENVIAR EMAIL CON CONFIGURACIÓN QUE SÍ FUNCIONA
        console.log('📤 Configurando Gmail...');
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'kheniavalos@gmail.com',
                pass: process.env.EMAIL_PASS,
            }
        });
        
        console.log('📤 Enviando email...');
        
        const info = await transporter.sendMail({
            from: '"Clinica Veterinaria" <kheniavalos@gmail.com>',
            to: email,
            subject: 'Restablece tu Contraseña',
            text: `Hola ${user.username}, haz clic aquí: ${resetLink}`,
            html: `<p>Hola <strong>${user.username}</strong>,</p>
                   <p><a href="${resetLink}">Haz clic aquí para resetear tu contraseña</a></p>`
        });
        
        console.log('✅ ¡EMAIL ENVIADO! ID:', info.messageId);
        
        return {
            success: true,
            resetToken: resetToken,
            resetLink: resetLink,
            message: 'Email enviado exitosamente'
        };

    } catch (error) {
        console.error('❌ Error:', error.message);
        
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