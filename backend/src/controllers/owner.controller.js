import Owner from '../models/owner.model.js';
import bcrypt from 'bcryptjs'; 
import { manejarError } from '../utils/errorHandler.js';  // ← IMPORTAR
import { sendWelcomeEmail } from '../services/authService.js';


// Obtener todos los clientes
// En clientes.controller.js
export const getClientes = async (req, res) => {
  try {
    // Solo clientes con estado completo
    const clientes = await Owner.find({ estado: 'completo' }).sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};     

export const createCliente = async (req, res) => {
  try {
    const { username, lastname, email, phoneNumber, cedula, direccion } = req.body;

    // Verificar si ya existe el email
    const existeCliente = await Owner.findOne({ email });
    if (existeCliente) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Contraseña por defecto
    const DEFAULT_PASSWORD = "veterinaria123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    const newCliente = new Owner({
      username,
      lastname,
      email,
      password: hashedPassword,
      phoneNumber,
      cedula,
      direccion,
      estado: 'completo'
    });

    const savedCliente = await newCliente.save();
    
    // ✅ Enviar correo de bienvenida
    try {
      await sendWelcomeEmail(email, username, DEFAULT_PASSWORD);
      console.log(`📧 Correo de bienvenida enviado a: ${email}`);
    } catch (emailError) {
      console.error(`❌ Error al enviar correo a ${email}:`, emailError.message);
    }
    
    // No enviar password en la respuesta
    const clienteResponse = savedCliente.toObject();
    delete clienteResponse.password;
    
    res.status(201).json({
      message: `Cliente creado exitosamente. Se ha enviado un correo con las credenciales a ${email}`,
      cliente: clienteResponse
    });
    
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Actualizar cliente
export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    console.log("ID recibido:", id);
    console.log("Datos recibidos:", data);
    
    // Si viene password, encriptarlo
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    
    const clienteActualizado = await Owner.findByIdAndUpdate(id, data, { new: true }).select('-password');
    
    if (!clienteActualizado) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    res.json(clienteActualizado);
  } catch (error) {
    const errorResponse = manejarError(error);
  res.status(errorResponse.status).json({ 
    message: errorResponse.message 
  });
  }
};

// Eliminar cliente
export const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    const clienteEliminado = await Owner.findByIdAndDelete(id);
    
    if (!clienteEliminado) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    const errorResponse = manejarError(error);
  res.status(errorResponse.status).json({ 
    message: errorResponse.message 
  });
  }
};

// Obtener un cliente por ID
export const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Owner.findById(id).select('-password');
    
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    res.json(cliente);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};