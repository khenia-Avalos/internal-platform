import mongoose from 'mongoose';

const internadoSchema = new mongoose.Schema({
  pacienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paciente',//referencia al paciente internado lo jala desde la coleccion de pacientes
    required: true
  },
  fechaIngreso: {
    type: Date,
    required: true
  },
  fechaEgreso: {
    type: Date
  },
  medicamentos: [{//esto es un subdocumento, no una referencia, es un array de objetos con campos propios
    nombre: String,
    dosis: String,
    via: String,
    frecuencia: String
  }],
  notas: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});


export default mongoose.model('Internado', internadoSchema);