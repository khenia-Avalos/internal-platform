// controllers/pacientes.controller.js
import Paciente from '../models/pacientes.model.js';
import { manejarError } from '../utils/errorHandler.js';

// Obtener todos los pacientes
export const getPaciente = async (req, res) => {
  try {
    const pacientes = await Paciente.find()
      .populate('ownerId', 'username lastname email phoneNumber cedula direccion');
    
    console.log("PRIMER PACIENTE CON POPULATE:", JSON.stringify(pacientes[0], null, 2));

    res.json(pacientes);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const createPaciente = async (req, res) => {
  try {
    const { nombre, especie, especieOtro, raza, edad, sexo, colorPelaje, peso, pesoUnidad, temperatura, antecedentesMedicos, ownerId } = req.body;

    const especieFinal = especie === 'otro' ? especieOtro : especie;

    const pesoObjeto = {
      valor: peso,
      unidad: pesoUnidad
    };
    
    const newPaciente = new Paciente({
      nombre,
      especie: especieFinal,
      raza,
      edad,
      sexo,
      colorPelaje,
      peso: pesoObjeto,
      temperatura,
      antecedentesMedicos,
      ownerId,
      // Nuevos campos por defecto
      fallecido: false,
      fechaFallecimiento: null,
      motivoFallecimiento: ''
    });

    const savedPaciente = await newPaciente.save();
    
    res.status(201).json(savedPaciente);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const updatePaciente = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    console.log("ID recibido:", id);
    console.log("Datos recibidos:", data);
    
    const pacienteActualizado = await Paciente.findByIdAndUpdate(id, data, { new: true })
      .populate('ownerId', 'username lastname email phoneNumber');
    
    if (!pacienteActualizado) {
      const error = new Error("Paciente no encontrado");
      error.name = 'CustomError';
      error.status = 404;
      throw error;
    }
    
    res.json(pacienteActualizado);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Eliminar paciente
export const deletePaciente = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pacienteEliminado = await Paciente.findByIdAndDelete(id);
    
    if (!pacienteEliminado) {
      const error = new Error("Paciente no encontrado");
      error.name = 'CustomError';
      error.status = 404;
      throw error;
    }
    
    res.json({ message: "Paciente eliminado correctamente" });
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
}

export const getPacienteByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    const todas = await Paciente.find();
    console.log("TODAS las mascotas:", todas.map(m => ({
      id: m._id,
      nombre: m.nombre,
      ownerId: m.ownerId
    })));
    
    const mascotas = await Paciente.find({ ownerId });
    console.log("RESULTADO FILTRADO:", mascotas.length);
    
    res.json(mascotas);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Obtener un paciente por ID
export const getPacienteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const paciente = await Paciente.findById(id)
      .populate('ownerId', 'username lastname email phoneNumber cedula direccion');
    
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    
    res.json(paciente);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// ============================================
// NUEVAS FUNCIONES PARA FALLECIDO
// ============================================

// Marcar paciente como fallecido
export const marcarFallecido = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivoFallecimiento } = req.body;
    
    console.log(`🕊️ Marcando paciente ${id} como fallecido`);
    
    const paciente = await Paciente.findById(id);
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    
    // Verificar si ya está fallecido
    if (paciente.fallecido) {
      return res.status(400).json({ 
        message: "El paciente ya está marcado como fallecido" 
      });
    }
    
    // Actualizar paciente
    const pacienteActualizado = await Paciente.findByIdAndUpdate(
      id,
      {
        fallecido: true,
        fechaFallecimiento: new Date(),
        motivoFallecimiento: motivoFallecimiento || 'No especificado'
      },
      { new: true }
    ).populate('ownerId', 'username lastname email phoneNumber');
    
    console.log(`✅ Paciente ${pacienteActualizado.nombre} marcado como fallecido`);
    
    res.json({
      message: `Paciente ${pacienteActualizado.nombre} marcado como fallecido`,
      data: pacienteActualizado
    });
    
  } catch (error) {
    console.error('Error en marcarFallecido:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Reactivar paciente (desmarcar como fallecido)
export const reactivarPaciente = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔄 Reactivando paciente ${id}`);
    
    const paciente = await Paciente.findById(id);
    if (!paciente) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    
    if (!paciente.fallecido) {
      return res.status(400).json({ 
        message: "El paciente no está marcado como fallecido" 
      });
    }
    
    const pacienteActualizado = await Paciente.findByIdAndUpdate(
      id,
      {
        fallecido: false,
        fechaFallecimiento: null,
        motivoFallecimiento: ''
      },
      { new: true }
    ).populate('ownerId', 'username lastname email phoneNumber');
    
    console.log(`✅ Paciente ${pacienteActualizado.nombre} reactivado`);
    
    res.json({
      message: `Paciente ${pacienteActualizado.nombre} reactivado exitosamente`,
      data: pacienteActualizado
    });
    
  } catch (error) {
    console.error('Error en reactivarPaciente:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};