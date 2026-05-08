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
            trim: true,
            unique: true,
            sparse: true  // Permite null/undefined para clientes temporales
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
            trim: true,
            default: ''  // Opcional para clientes temporales
        },
        password: {
            type: String,
            required: function() {
                // La contraseña solo es requerida para usuarios completos
                return this.estado === 'completo';
            }
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
            enum: ['admin', 'employee', 'client', 'doctor'],
            default: 'client' 
        },
        especialidad: {
            type: String,
            enum: ['Medicina General', 'Groomer', 'Cirugía'],
            required: function() { 
                return this.role === 'doctor'; 
            }
        },
        cedula: {
            type: String,
            required: function() { 
                return this.role === 'client' && this.estado === 'completo';
            },
            unique: true,
            sparse: true
        },
        direccion: {
            type: String,
            required: function() { 
                return this.role === 'client' && this.estado === 'completo';
            }
        },
        // ============================================
        // NUEVOS CAMPOS PARA CLIENTES TEMPORALES
        // ============================================
        estado: {
            type: String,
            enum: ['completo', 'temporal', 'incompleto'],
            default: 'completo'
        },
        citasTemporales: [{
            fecha: { type: String },
            horaInicio: { type: String },
            horaFin: { type: String },
            notas: { type: String, default: '' },
            doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
            tipoCita: { type: String, default: 'consulta' },
            sintomas: { type: String, default: '' },
            tiempoSintomas: { type: String, default: '' },
            pacienteTemporal: {
                nombre: { type: String, required: true },
                especie: { type: String, required: true }
            },
            creadaEn: { type: Date, default: Date.now },
            convertida: { type: Boolean, default: false },  citaRealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cita',
    default: null
  }
        }],
        mascotaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Paciente',
            default: null
        }
    }, 
    {
        timestamps: true
    }
)

export default mongoose.model('Owner', userSchema)