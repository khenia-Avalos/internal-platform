import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { manejarError } from '../utils/errorHandler.js';  // ← IMPORTAR


// Obtener todos los doctores
export const getDoctores = async (req, res) => {
  try {
    const doctores = await User.find({ role: "doctor" }).select('-password');
    res.json(doctores);
  } catch (error) {
  const errorResponse = manejarError(error);
  res.status(errorResponse.status).json({ 
    message: errorResponse.message 
  });  }
};

// Crear un nuevo doctor
export const createDoctor = async (req, res) => {
  try {
    const { username, lastname, email, password, phoneNumber, especialidad } = req.body;

    // Verificar si ya existe el email
    if (existeDoctor) {
  const error = new Error("El email ya está registrado");
  error.name = 'CustomError';
  error.status = 400;
  throw error;
}

    // Encriptar password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newDoctor = new User({
      username,
      lastname,
      email,
      password: hashedPassword, // ← Encriptado
      phoneNumber,
      role: "doctor",
      especialidad
    });

    const savedDoctor = await newDoctor.save();
    
    // No enviar password en la respuesta
    const doctorResponse = savedDoctor.toObject();
    delete doctorResponse.password;
    
    res.status(201).json(doctorResponse);
  } catch (error) {
   const errorResponse = manejarError(error);
  res.status(errorResponse.status).json({ 
    message: errorResponse.message 
  });
  }
};

// Actualizar doctor
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    console.log("ID recibido:", id);
    console.log("Datos recibidos:", data);
    
    // Si viene password, encriptarla
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    
    const doctorActualizado = await User.findByIdAndUpdate(id, data, { new: true })
      .select('-password'); // ← Excluir password
    
    if (!doctorActualizado) {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    
    res.json(doctorActualizado);
  } catch (error) {
    const errorResponse = manejarError(error);
  res.status(errorResponse.status).json({ 
    message: errorResponse.message 
  });
  }
};

// Eliminar doctor
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctorEliminado = await User.findByIdAndDelete(id);
    
    if (!doctorEliminado) {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    
    res.json({ message: "Doctor eliminado correctamente" });
  } catch (error) {
  const errorResponse = manejarError(error);
  res.status(errorResponse.status).json({ 
    message: errorResponse.message 
  });  }
};