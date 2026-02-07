import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // Información de la cita
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // HH:mm formato 24h
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Formato de hora inválido (HH:mm)'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Formato de hora inválido (HH:mm)'
    }
  },
  
  // Estado y tipo
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['consulta', 'vacunacion', 'cirugia', 'grooming', 'urgencia', 'seguimiento', 'otros'],
    default: 'consulta'
  },
  
  // Relaciones
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  veterinarian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Información adicional
  service: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  paid: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  
  // Recordatorios
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderDate: {
    type: Date
  },
  
  // Check-in/out
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  duration: {
    type: Number, // en minutos
    min: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

// Índices para búsqueda rápida
appointmentSchema.index({ appointmentDate: 1, startTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ pet: 1 });
appointmentSchema.index({ owner: 1 });
appointmentSchema.index({ veterinarian: 1 });
appointmentSchema.index({ userId: 1 });

// Middleware para calcular duración automáticamente
appointmentSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const [startHours, startMinutes] = this.startTime.split(':').map(Number);
    const [endHours, endMinutes] = this.endTime.split(':').map(Number);
    
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    
    this.duration = endTotal - startTotal;
  }
  next();
});

export default mongoose.model('Appointment', appointmentSchema);