import mongoose from 'mongoose';

const pausaSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fecha: {
    type: Date,
    required: true,
    default: Date.now
  },
  inicio: {
    type: Date,
    required: true,
    default: Date.now
  },
  fin: {
    type: Date,
    default: null
  },
  activa: {
    type: Boolean,
    default: true
  },
  motivo: {
    type: String,
    default: "almuerzo"
  }
}, {
  timestamps: true
});

export default mongoose.model('Pausa', pausaSchema);