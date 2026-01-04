import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        username: {
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
     phoneNumber: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function(v) {
                    // Remover todos los caracteres no numéricos
                    const digitsOnly = v.replace(/\D/g, '');
                    // Verificar si tiene al menos 8 dígitos
                    return digitsOnly.length >= 8;
                },
                message: props => `Phone number must have at least 8 digits. You entered: ${props.value}`
            }
        },  
        lastname: {
            type: String,
            required: true,
            trim: true,
          
        },
        password: {
            type: String,
            required: true,
        },
       
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        }
    }, {
        timestamps: true
    }
)

export default mongoose.model('User', userSchema)