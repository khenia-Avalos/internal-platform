import mongoose from 'mongoose';

const citaSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',
    required: false
  },
  fecha: {
    type: Date,
    required: true  
  },
  horaInicio: {
    type: String,
    required: true, 
    trim: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  horaFin: {
    type: String,
    required: true,
    trim: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  motivo: {
    type: String,
    trim: true,
    default: ''
  },
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
    default: 'pendiente'
  },
  notas: {
    type: String,
    trim: true,
    default: ''
  },
  //  CAMPOS AGREGADOS
  tipoCita: {
    type: String,
    enum: ['consulta', 'vacunacion', 'cirugia', 'estetica'],
    default: 'consulta'
  },
  titulo: {
    type: String,
    default: ''
  },
  descripcion: {
    type: String,
    default: ''
  },
  tokenConfirmacion: {
    type: String,
    default: null
  },
   esCitaTemporal: {
    type: Boolean,
    default: false,
    description: 'True = cita de cliente temporal, False = cita de cliente registrado'
  },
  // Para rastrear la cita temporal
clienteTemporalId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Owner',
  default: null
},
pacienteTemporal: {
  nombre: { type: String, default: null },
  especie: { type: String, default: null }
},
 sintomas: {
    type: String,
    trim: true,
    default: ''
  },
  tiempoSintomas: {
    type: String,
    trim: true,
    default: ''
  },
}, {
  timestamps: true
});

export default mongoose.model('Cita', citaSchema);