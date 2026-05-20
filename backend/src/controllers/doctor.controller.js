import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { manejarError } from '../utils/errorHandler.js';  
import Horario from '../models/horario.model.js';
import { getHorarioPorDefecto } from '../../config/horariosPorDefecto.js';
import { sendWelcomeEmailDoctor } from '../services/authService.js';


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
// Crear un nuevo doctor
export const createDoctor = async (req, res) => {
  try {
    const { username, lastname, email, phoneNumber, especialidad } = req.body; // ← Eliminado password
    
    // Verificar si ya existe el email
    const existeDoctor = await User.findOne({ email });
    if (existeDoctor) {
      const error = new Error("El email ya está registrado");
      error.name = 'CustomError';
      error.status = 400;
      throw error;
    }
    
    //  Contraseña predeterminada para doctores
    const DEFAULT_PASSWORD = "veteDocElExito123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);
    
    const newDoctor = new User({
      username,
      lastname,
      email,
      password: hashedPassword,
      phoneNumber,
      role: "doctor",
      especialidad
    });
    
    const savedDoctor = await newDoctor.save();
    
    //  Crear horarios por defecto según especialidad
    const horarioConfig = getHorarioPorDefecto(especialidad);
    const horariosPorDefecto = horarioConfig.dias.map(dia => ({
      doctorId: savedDoctor._id,
      dia,
      horaInicio: horarioConfig.horaInicio,
      horaFin: horarioConfig.horaFin,
      intervalo: horarioConfig.intervalo,
      activo: horarioConfig.activo
    }));
    await Horario.insertMany(horariosPorDefecto);
    
    //  Enviar correo de bienvenida al doctor
    try {
      await sendWelcomeEmailDoctor(email, username, DEFAULT_PASSWORD);
      console.log(` Correo de bienvenida enviado al doctor: ${email}`);
    } catch (emailError) {
      console.error(" Error enviando correo:", emailError.message);
    }
    
    // No enviar password en la respuesta
    const doctorResponse = savedDoctor.toObject();
    delete doctorResponse.password;
    
    res.status(201).json({
      message: "Doctor creado exitosamente. Se ha enviado un correo con las credenciales.",
      doctor: doctorResponse
    });
    
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


// Obtener un doctor por ID
export const getDoctorByIdRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await User.findById(id).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    
    res.json(doctor);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};


// OBTENER DOCTORES PÚBLICOS (SIN AUTENTICACIÓN)

export const getDoctoresPublicos = async (req, res) => {
  try {
    console.log('\n========== GET DOCTORES PUBLICOS ==========');
    
    // Solo devolver campos públicos
    const doctores = await User.find({ 
      role: 'doctor',
    }).select('username lastname especialidad _id');
    
    console.log(` Enviando ${doctores.length} doctores públicos`);
    res.json(doctores);
    
  } catch (error) {
    console.error(' Error en getDoctoresPublicos:', error);
    res.status(500).json({ message: 'Error al cargar veterinarios' });
  }
};