import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema({
  // Información personal
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
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
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  dni: {
    type: String,
    trim: true,
    unique: true
  },
  
  // Relaciones
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Metadata
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  notes: {
    type: String,
    trim: true
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