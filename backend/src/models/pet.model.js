import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  // Información básica
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    enum: ['Perro', 'Gato', 'Ave', 'Roedor', 'Reptil', 'Otro'],
    default: 'Perro'
  },
  breed: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Macho', 'Hembra', 'Desconocido'],
    default: 'Desconocido'
  },
  
  // Información médica básica
  birthDate: {
    type: Date
  },
  weight: {
    type: Number,
    min: 0
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'g', 'lb'],
    default: 'kg'
  },
  chipNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  
  // Información médica
  allergies: [String],
  medications: [String],
  specialConditions: {
    type: String,
    trim: true
  },
  
  // Relaciones
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Metadata
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'deceased', 'transferred', 'archived'],
    default: 'active'
  },
  
  // Características físicas
  sterilized: {
    type: Boolean,
    default: false
  },
  lastVisit: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices
petSchema.index({ name: 1 });
petSchema.index({ species: 1 });
petSchema.index({ owner: 1 });
petSchema.index({ userId: 1 });

export default mongoose.model('Pet', petSchema);