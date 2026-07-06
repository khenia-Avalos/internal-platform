// models/user.model.js
import mongoose from 'mongoose'

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
        emailOriginal: {
            type: String,
            default: null
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
            enum: ['admin', 'employee', 'client', 'doctor', 'recepcion'],
            default: 'client' 
        },
        especialidad: {
            type: String,
            enum: ['Medicina General', 'Groomer', 'Cirugía', 'Recepcionista'],
            required: function() { 
                return this.role === 'doctor' || this.role === 'recepcion'; 
            }
        },
        // ========== CAMPOS DE BLOQUEO Y VACACIONES ==========
        bloqueado: {
            type: Boolean,
            default: false
        },
        fechaRetiro: {
            type: Date,
            default: null
        },
        vacacionesActivas: {
            type: Boolean,
            default: false
        },
        fechaInicioVacaciones: {
            type: Date,
            default: null
        },
        fechaFinVacaciones: {
            type: Date,
            default: null
        },
        activo: {
            type: Boolean,
            default: true
        },
        motivoBloqueo: {
            type: String,
            default: 'Retiro voluntario'
        }
    }, {
        timestamps: true
    }
)

export default mongoose.model('User', userSchema)