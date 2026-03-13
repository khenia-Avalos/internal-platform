import Paciente from '../models/pacientes.model.js';
import { manejarError } from '../utils/errorHandler.js';  // ← IMPORTAR

// Obtener todos los pacientes
export const getPaciente = async (req, res) => {
  try {
    const pacientes = await Paciente.find().populate('ownerId', 'username lastname email phoneNumber'); 
    console.log("PRIMER PACIENTE CON POPULATE:", JSON.stringify(pacientes[0], null, 2));

    res.json(pacientes);
  } catch (error) {
  const errorResponse = manejarError(error);
  res.status(errorResponse.status).json({ 
    message: errorResponse.message 
  });  }
};


export const createPaciente = async (req, res) => {
  try {
    const { nombre, especie,especieOtro, raza, edad, sexo, colorPelaje, peso,pesoUnidad, temperatura, antecedentesMedicos, ownerId } = req.body;


const especieFinal = especie === 'otro' ? especieOtro : especie;

    // Crear el objeto peso
    const pesoObjeto = {
      valor: peso,
      unidad: pesoUnidad
    };
    const newPaciente = new Paciente({
      nombre,
      especie:especieFinal,  // ← Usa la variable final que maneja "otro"
     raza,
     edad,
     sexo,
        colorPelaje,
      peso: pesoObjeto,  // ← Guardas el objeto completo
        pesoUnidad,
        temperatura,
        antecedentesMedicos,
      ownerId
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
    
    // 1. Buscar y actualizar
    const pacienteActualizado = await Paciente.findByIdAndUpdate(id, data, { new: true })   .populate('ownerId', 'username lastname email phoneNumber');
    
    // 2. Verificar si existe
    if (!pacienteActualizado) {
  const error = new Error("Paciente no encontrado");
  error.name = 'CustomError';
  error.status = 404;
  throw error;
}
    
    // 3. Responder
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
    
   if (!pacienteActualizado) {
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
  
    
    // Buscar TODAS las mascotas para comparar
    const todas = await Paciente.find();
    console.log("TODAS las mascotas:", todas.map(m => ({
      id: m._id,
      nombre: m.nombre,
      ownerId: m.ownerId
    })));
    
    const mascotas = await Paciente.find({ ownerId });
    console.log(" RESULTADO FILTRADO:", mascotas.length);
    
    res.json(mascotas);
  } catch (error) {
  const errorResponse = manejarError(error);
  res.status(errorResponse.status).json({ 
    message: errorResponse.message 
  });
  }
};