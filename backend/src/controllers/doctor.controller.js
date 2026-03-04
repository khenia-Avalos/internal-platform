import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

// Obtener todos los doctores
export const getDoctores = async (req, res) => {
  try {
    const doctores = await User.find({ role: "doctor" }).select('-password');
    res.json(doctores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo doctor
export const createDoctor = async (req, res) => {
  try {
    const { username, lastname, email, password, phoneNumber, especialidad } = req.body;

    // Verificar si ya existe el email
    const existeDoctor = await User.findOne({ email });
    if (existeDoctor) {
      return res.status(400).json({ message: "El email ya está registrado" });
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
    console.log("ERROR COMPLETO:", error);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack 
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
    console.error("ERROR COMPLETO EN UPDATE:", error);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack 
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
    res.status(500).json({ message: error.message });
  }
};