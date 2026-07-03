import mongoose from 'mongoose';

const documentoSchema = new mongoose.Schema({
    pacienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        required: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    tipo: {
        type: String,
        enum: ['resultado_lab', 'radiografia', 'receta', 'informe', 'otro'],
        default: 'otro'
    },
    descripcion: {
        type: String,
        default: '',
        trim: true
    },
    url: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        default: null
    },
    subidoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

export default mongoose.model('Documento', documentoSchema);