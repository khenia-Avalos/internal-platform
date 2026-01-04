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