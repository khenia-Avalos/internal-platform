import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema({
  // Información personal
  firstName: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    trim: true,
    lowercase: true,
    unique: true
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  dni: {
    type: String,
    trim: true,
    default: ''  // Cambiado: sin unique, valor por defecto vacío
  },
  
  // Relaciones
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Metadata
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' }
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para búsqueda rápida
ownerSchema.index({ firstName: 1, lastName: 1 });
ownerSchema.index({ email: 1 });
ownerSchema.index({ phone: 1 });
ownerSchema.index({ userId: 1 });

export default mongoose.model('Owner', ownerSchema);