import mongoose from 'mongoose'

const pacienteSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true
        },

  especie: {
            type: String,
            required: true,
                enum: ['perro', 'gato', 'ave', 'conejo', 'otro'],  // ← Valores permitidos

            trim: true
        },
          raza: {
            type: String,
                trim: true

        },
          edad: {
            type: Number,
                min: 0

        },
         sexo: {
            type: String,
            enum: ['macho', 'hembra'],
            trim: true
        },
            
         colorPelaje: {
            type: String,
            trim: true
        },
          peso: {
            type: Number,
            min: 0
        },
          temperatura: {
            type: Number,
        
        },
antecedentesMedicos: {
    type: String,
    trim: true
},
ownerId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Owner',
  required: true  
},
codigoIdentificacion: {
  type: String,
  unique: true,
  sparse: true,   
  trim: true
}
    }, {
        timestamps: true
    }
)
// Índice compuesto para evitar duplicados de (ownerId + nombre)
pacienteSchema.index({ ownerId: 1, nombre: 1 }, { unique: true });
export default mongoose.model('Paciente', pacienteSchema)