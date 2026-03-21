import mongoose from 'mongoose';

const internadoSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: true
  },
  fechaIngreso: {
    type: Date,
    required: true
  },
  fechaEgreso: {
    type: Date
  },
  medicamento: {      
    type: String,
    trim: true
  },
  via: {               
    type: String,
    trim: true
  },
  dosis: {             
    type: String,
    trim: true
  },
  notas: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Internado', internadoSchema);