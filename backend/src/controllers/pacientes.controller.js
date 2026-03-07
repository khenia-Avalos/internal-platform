import Paciente from '../models/pacientes.model.js';

// Obtener todos los pacientes
export const getPaciente = async (req, res) => {
  try {
    const pacientes = await Paciente.find().populate('ownerId', 'username lastname email phoneNumber'); 
    console.log("PRIMER PACIENTE CON POPULATE:", JSON.stringify(pacientes[0], null, 2));

    res.json(pacientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const createPaciente = async (req, res) => {
  try {
    const { nombre, especie, raza, edad, sexo, colorPelaje, peso, temperatura, antecedentesMedicos, ownerId } = req.body;

    const newPaciente = new Paciente({
      nombre,
      especie,
     raza,
     edad,
     sexo,
        colorPelaje,
        peso,
        temperatura,
        antecedentesMedicos,
      ownerId
    });

    const savedPaciente = await newPaciente.save();
    

res.status(201).json(savedPaciente);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Ya existe una mascota con ese nombre para este dueño" 
      });
    }
    console.error("ERROR COMPLETO:", error);
    res.status(500).json({      
      message: error.message,
      stack: error.stack 
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
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    
    // 3. Responder
    res.json(pacienteActualizado);
  } catch (error) {
    console.error("ERROR COMPLETO EN UPDATE:", error);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack 
    });
  }
};

// Eliminar paciente
export const deletePaciente = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pacienteEliminado = await Paciente.findByIdAndDelete(id);
    
    if (!pacienteEliminado) {
      return res.status(404).json({ message: "Paciente no encontrado" });
    }
    
    res.json({ message: "Paciente eliminado correctamente" });
  } catch (error) {
    console.error("ERROR COMPLETO EN DELETE:", error);
    res.status(500).json({ 
      message: error.message,
        stack: error.stack
   
    });
  }
}