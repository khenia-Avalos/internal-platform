import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { manejarError } from '../utils/errorHandler.js';  
import Horario from '../models/horario.model.js';
import { getHorarioPorDefecto } from '../../config/horariosPorDefecto.js';
import { sendWelcomeEmailDoctor } from '../services/authService.js';

// Obtener todos los doctores
export const getDoctores = async (req, res) => {
  try {
    const doctores = await User.find({ role: { $in: ["doctor", "recepcion"] } }).select('-password');
    res.json(doctores);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Crear un nuevo doctor / recepcionista
export const createDoctor = async (req, res) => {
  try {
    const { username, lastname, email, phoneNumber, especialidad } = req.body;
    
    const existeDoctor = await User.findOne({ email });
    if (existeDoctor) {
      const error = new Error("El email ya está registrado");
      error.name = 'CustomError';
      error.status = 400;
      throw error;
    }
    
    let DEFAULT_PASSWORD;
    let role;
    
    if (especialidad === 'Recepcionista') {
      DEFAULT_PASSWORD = 'recepcionElExito2026';
      role = 'recepcion';
    } else {
      DEFAULT_PASSWORD = 'veteDocElExito123';
      role = 'doctor';
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);
    
    const newUser = new User({
      username,
      lastname,
      email,
      password: hashedPassword,
      phoneNumber,
      role: role,
      especialidad: especialidad === 'Recepcionista' ? 'Recepcionista' : especialidad,
      // Nuevos campos por defecto
      bloqueado: false,
      vacacionesActivas: false,
      activo: true
    });
    
    const savedUser = await newUser.save();
    
    if (role === 'doctor' || role === 'recepcion') {
      const horarioConfig = getHorarioPorDefecto(especialidad);
      
      if (horarioConfig && horarioConfig.dias) {
        const horariosPorDefecto = horarioConfig.dias.map(dia => ({
          doctorId: savedUser._id,
          dia,
          horaInicio: horarioConfig.horaInicio,
          horaFin: horarioConfig.horaFin,
          intervalo: horarioConfig.intervalo,
          activo: horarioConfig.activo
        }));
        await Horario.insertMany(horariosPorDefecto);
        console.log(`✅ Horarios creados para ${savedUser.username} (${especialidad})`);
      }
    }
    
    if (role === 'doctor') {
      try {
        await sendWelcomeEmailDoctor(email, username, DEFAULT_PASSWORD);
        console.log(`Correo de bienvenida enviado al doctor: ${email}`);
      } catch (emailError) {
        console.error("Error enviando correo:", emailError.message);
      }
    }
    
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      message: role === 'recepcion' 
        ? `Recepcionista creado exitosamente. Contraseña: ${DEFAULT_PASSWORD}`
        : 'Doctor creado exitosamente. Se ha enviado un correo con las credenciales.',
      user: userResponse
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
    
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    
    const doctorActualizado = await User.findByIdAndUpdate(id, data, { new: true })
      .select('-password');
    
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
    });
  }
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
    
    const doctores = await User.find({ 
      role: 'doctor',
      bloqueado: { $ne: true },  // Excluir bloqueados
      activo: true               // Solo activos
    }).select('username lastname especialidad _id');
    
    console.log(`Enviando ${doctores.length} doctores públicos`);
    res.json(doctores);
    
  } catch (error) {
    console.error('Error en getDoctoresPublicos:', error);
    res.status(500).json({ message: 'Error al cargar veterinarios' });
  }
};

// ============================================
// NUEVAS FUNCIONES PARA BLOQUEAR Y VACACIONES
// ============================================

// Bloquear doctor (retiro)
export const bloquearDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔒 Bloqueando doctor con ID: ${id}`);
    
    // 1. Cambiar contraseña
    const nuevaPassword = 'UsuarioRetiradoElExito';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);
    
    // 2. Actualizar usuario
    const usuarioActualizado = await User.findByIdAndUpdate(
      id,
      { 
        password: hashedPassword,
        bloqueado: true,
        fechaRetiro: new Date(),
        activo: false,
        vacacionesActivas: false // Desactivar vacaciones si estaba en ellas
      },
      { new: true }
    ).select('-password');
    
    if (!usuarioActualizado) {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    
    // 3. Desactivar todos los horarios del doctor
    await Horario.updateMany(
      { doctorId: id },
      { activo: false }
    );
    
    console.log(`✅ Doctor ${usuarioActualizado.username} bloqueado exitosamente`);
    
    res.json({
      message: 'Doctor bloqueado exitosamente. Contraseña cambiada a: UsuarioRetiradoElExito',
      data: usuarioActualizado
    });
  } catch (error) {
    console.error('Error en bloquearDoctor:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Activar vacaciones
export const activarVacaciones = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🌴 Activando vacaciones para doctor ID: ${id}`);
    
    // 1. Actualizar usuario
    const usuarioActualizado = await User.findByIdAndUpdate(
      id,
      { 
        vacacionesActivas: true,
        fechaInicioVacaciones: new Date(),
        fechaFinVacaciones: null // Limpiar fecha de fin anterior
      },
      { new: true }
    ).select('-password');
    
    if (!usuarioActualizado) {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    
    // 2. Desactivar todos los horarios del doctor
    await Horario.updateMany(
      { doctorId: id },
      { activo: false }
    );
    
    console.log(`✅ Vacaciones activadas para ${usuarioActualizado.username}`);
    
    res.json({
      message: 'Vacaciones activadas exitosamente. Todos los horarios desactivados.',
      data: usuarioActualizado
    });
  } catch (error) {
    console.error('Error en activarVacaciones:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Desactivar vacaciones
export const desactivarVacaciones = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`✅ Desactivando vacaciones para doctor ID: ${id}`);
    
    // 1. Actualizar usuario
    const usuarioActualizado = await User.findByIdAndUpdate(
      id,
      { 
        vacacionesActivas: false,
        fechaFinVacaciones: new Date()
      },
      { new: true }
    ).select('-password');
    
    if (!usuarioActualizado) {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    
    // 2. Activar todos los horarios del doctor
    await Horario.updateMany(
      { doctorId: id },
      { activo: true }
    );
    
    console.log(`✅ Vacaciones desactivadas para ${usuarioActualizado.username}`);
    
    res.json({
      message: 'Vacaciones desactivadas exitosamente. Todos los horarios activados.',
      data: usuarioActualizado
    });
  } catch (error) {
    console.error('Error en desactivarVacaciones:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};