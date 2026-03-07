import Owner from '../models/owner.model.js';
import bcrypt from 'bcryptjs'; 

// Obtener todos los clientes
export const getClientes = async (req, res) => {
  try {
    const clientes = await Owner.find().select('-password');
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo cliente
export const createCliente = async (req, res) => {
  try {
    const { username, lastname, email, password, phoneNumber, cedula, direccion } = req.body;

    // Verificar si ya existe el email
    const existeCliente = await Owner.findOne({ email });
    if (existeCliente) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Encriptar password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCliente = new Owner({
      username,
      lastname,
      email,
      password: hashedPassword,  // ← Guardar encriptada
      phoneNumber,
      // role: "client" ← ELIMINADO (no existe en Owner)
      cedula,
      direccion
    });

    const savedCliente = await newCliente.save();
    
    // No enviar password en la respuesta
    const clienteResponse = savedCliente.toObject();
    delete clienteResponse.password;
    
    res.status(201).json(clienteResponse);
  } catch (error) {
    console.log("ERROR COMPLETO:", error);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack 
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
    console.error("ERROR COMPLETO EN UPDATE:", error);
    res.status(500).json({ 
      message: error.message,
      stack: error.stack 
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};