import User from '../models/user.model.js';

// Obtener todos los clientes (usuarios con rol "cliente")
export const getClientes = async (req, res) => {
  try {
    const clientes = await User.find({ role: "client" }).select('-password');
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo cliente
export const createCliente = async (req, res) => {
  try {
    const { username, lastname, email, password, phoneNumber, cedula, direccion } = req.body;

    const newCliente = new User({
      username,
      lastname,
      email,
      password,
      phoneNumber,
      role: "cliente",
      cedula,
      direccion
    });

    const savedCliente = await newCliente.save();
    res.status(201).json(savedCliente);
  } catch (error) {
console.log("ERROR COMPLETO:", error);
res.status(500).json({ 
  message: error.message,
  stack: error.stack 
});  }

};
export const updateCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    console.log("ID recibido:", id);
    console.log("Datos recibidos:", data);
    
    const clienteActualizado = await User.findByIdAndUpdate(id, data, { new: true });
    
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
export const deleteCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    const clienteEliminado = await User.findByIdAndDelete(id);
    
    if (!clienteEliminado) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};