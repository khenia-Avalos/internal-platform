// backend/src/models/user.model.js
import mongoose from 'mongoose';

// Schema para horarios
const timeSlotSchema = new mongoose.Schema({
  start: { 
    type: String, 
    default: '08:00',
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} no es un formato de hora válido (HH:MM)`
    }
  },
  end: { 
    type: String, 
    default: '17:00',
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} no es un formato de hora válido (HH:MM)`
    }
  },
  available: { 
    type: Boolean, 
    default: true 
  }
}, { _id: false });

// Schema para disponibilidad semanal
const availabilitySchema = new mongoose.Schema({
  monday: { type: timeSlotSchema, default: () => ({ start: '08:00', end: '17:00', available: true }) },
  tuesday: { type: timeSlotSchema, default: () => ({ start: '08:00', end: '17:00', available: true }) },
  wednesday: { type: timeSlotSchema, default: () => ({ start: '08:00', end: '17:00', available: true }) },
  thursday: { type: timeSlotSchema, default: () => ({ start: '08:00', end: '17:00', available: true }) },
  friday: { type: timeSlotSchema, default: () => ({ start: '08:00', end: '17:00', available: true }) },
  saturday: { type: timeSlotSchema, default: () => ({ start: '09:00', end: '13:00', available: false }) },
  sunday: { type: timeSlotSchema, default: () => ({ start: '09:00', end: '13:00', available: false }) }
}, { _id: false });

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
      unique: true,
      lowercase: true
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
        message: "Formato inválido. Usa +50670983832 o +506 7098 3832"
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
    active: {
      type: Boolean,
      default: true
    },
    // Información adicional para veterinarios
    specialty: {
      type: String,
      trim: true,
      default: 'Medicina General'
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: null
    },
    // ⚠️ CAMPO NUEVO: Disponibilidad por defecto para veterinarios
    defaultAvailability: {
      type: availabilitySchema,
      default: () => ({
        monday: { start: '08:00', end: '17:00', available: true },
        tuesday: { start: '08:00', end: '17:00', available: true },
        wednesday: { start: '08:00', end: '17:00', available: true },
        thursday: { start: '08:00', end: '17:00', available: true },
        friday: { start: '08:00', end: '17:00', available: true },
        saturday: { start: '09:00', end: '13:00', available: false },
        sunday: { start: '09:00', end: '13:00', available: false }
      })
    },
    // ⚠️ CAMPO NUEVO: Duración de citas para veterinarios
    appointmentDuration: {
      type: Number,
      default: 30,
      min: 15,
      max: 120
    }
  },
  { 
    timestamps: true 
  }
);

// Índices para mejorar búsquedas
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export default mongoose.model('User', userSchema);