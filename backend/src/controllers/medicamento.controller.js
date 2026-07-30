// backend/src/controllers/medicamento.controller.js
import Medicamento from '../models/medicamento.model.js';
import { manejarError } from '../utils/errorHandler.js';

// Obtener todos los medicamentos
export const getMedicamentos = async (req, res) => {
  try {
    const medicamentos = await Medicamento.find({ activo: true }).sort({ nombre: 1 });
    res.json(medicamentos);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Obtener un medicamento por ID
export const getMedicamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const medicamento = await Medicamento.findById(id);
    
    if (!medicamento) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }
    
    res.json(medicamento);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Buscar medicamentos
export const buscarMedicamentos = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      const medicamentos = await Medicamento.find({ activo: true }).sort({ nombre: 1 });
      return res.json(medicamentos);
    }
    
    const medicamentos = await Medicamento.find({
      $or: [
        { nombre: { $regex: q, $options: 'i' } },
        { paraQueSirve: { $regex: q, $options: 'i' } },
        { presentacion: { $regex: q, $options: 'i' } },
        { via: { $regex: q, $options: 'i' } }
      ],
      activo: true
    }).sort({ nombre: 1 });
    
    res.json(medicamentos);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Crear un medicamento
export const createMedicamento = async (req, res) => {
  try {
    const { nombre, foto, via, presentacion, paraQueSirve, dosis, contraindicaciones, efectosSecundarios } = req.body;
    
    // Verificar si ya existe
    const existe = await Medicamento.findOne({ nombre: { $regex: new RegExp(`^${nombre}$`, 'i') } });
    if (existe) {
      return res.status(400).json({ 
        message: `Ya existe un medicamento con el nombre "${nombre}"`,
        field: 'nombre'
      });
    }
    
    const nuevoMedicamento = new Medicamento({
      nombre,
      foto: foto || '',
      via,
      presentacion,
      paraQueSirve,
      dosis: dosis || '',
      contraindicaciones: contraindicaciones || '',
      efectosSecundarios: efectosSecundarios || '',
      activo: true
    });
    
    const medicamentoGuardado = await nuevoMedicamento.save();
    res.status(201).json(medicamentoGuardado);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Actualizar un medicamento
export const updateMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, foto, via, presentacion, paraQueSirve, dosis, contraindicaciones, efectosSecundarios, activo } = req.body;
    
    // Verificar si existe otro con el mismo nombre
    if (nombre) {
      const existe = await Medicamento.findOne({ 
        nombre: { $regex: new RegExp(`^${nombre}$`, 'i') },
        _id: { $ne: id }
      });
      if (existe) {
        return res.status(400).json({ 
          message: `Ya existe un medicamento con el nombre "${nombre}"`,
          field: 'nombre'
        });
      }
    }
    
    const medicamentoActualizado = await Medicamento.findByIdAndUpdate(
      id,
      { nombre, foto, via, presentacion, paraQueSirve, dosis, contraindicaciones, efectosSecundarios, activo },
      { new: true }
    );
    
    if (!medicamentoActualizado) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }
    
    res.json(medicamentoActualizado);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Eliminar (desactivar) un medicamento
export const deleteMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medicamento = await Medicamento.findById(id);
    if (!medicamento) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }
    
    // Desactivar en lugar de eliminar
    medicamento.activo = false;
    await medicamento.save();
    
    res.json({ 
      message: 'Medicamento desactivado correctamente',
      medicamento 
    });
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};