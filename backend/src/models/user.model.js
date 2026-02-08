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
        defaultAvailability: {
            monday: { start: "09:00", end: "17:00", available: true },
            tuesday: { start: "09:00", end: "17:00", available: true },
            wednesday: { start: "09:00", end: "17:00", available: true },
            thursday: { start: "09:00", end: "17:00", available: true },
            friday: { start: "09:00", end: "17:00", available: true },
            saturday: { start: "09:00", end: "13:00", available: false },
            sunday: { start: "09:00", end: "13:00", available: false }
        },
        // Excepciones (vacaciones, días libres)
        exceptions: [{
            date: Date,
            reason: String,
            available: Boolean
        }],
        // Duración de citas por defecto (en minutos)
        appointmentDuration: {
            type: Number,
            default: 30,
            min: 15,
            max: 120
        },
        active: {
            type: Boolean,
            default: true
        }
    }, {
        timestamps: true
    }
);

export default mongoose.model('User', userSchema);