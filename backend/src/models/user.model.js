// backend/src/models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function(v) {
                    const phoneRegex = /^\+\d{1,4}[0-9\s\-]{8,15}$/;
                    return phoneRegex.test(v);
                },
                message: "Invalid phone format. Use +50670983832 or +506 7098 3832"
            }
        },
        lastname: {
            type: String,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        },
        role: {
            type: String,
            enum: ['admin', 'veterinarian', 'assistant', 'client'],
            default: 'client' 
        },
        // Información adicional para veterinarios
        specialty: {
            type: String,
            trim: true
        },
        licenseNumber: {
            type: String,
            trim: true
        },
        // Disponibilidad por defecto (lunes a viernes 9am-5pm)
    },
    { timestamps: true }
);

export default mongoose.model('User', userSchema);