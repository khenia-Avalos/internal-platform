import bcrypt from 'bcryptjs';
import Cliente from '../models/owner.model.js';

// ============================================
// OBTENER TODOS LOS CLIENTES TEMPORALES
// ============================================
export const getClientesTemporales = async (req, res) => {
  try {
    const clientes = await Cliente.find({ 
      estado: { $in: ['temporal', 'incompleto'] } 
    }).sort({ createdAt: -1 });
    
    res.json(clientes);
  } catch (error) {
    console.error('Error en getClientesTemporales:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// OBTENER CLIENTE TEMPORAL POR ID
// ============================================
export const getClienteTemporalById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    if (cliente.estado !== 'temporal' && cliente.estado !== 'incompleto') {
      return res.status(400).json({ message: 'No es un cliente temporal' });
    }
    
    res.json(cliente);
  } catch (error) {
    console.error('Error en getClienteTemporalById:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// CREAR CLIENTE TEMPORAL (AGENDAMIENTO RÁPIDO)
// ============================================
export const createClienteTemporal = async (req, res) => {
  try {
    const { 
      username, 
      phoneNumber, 
      email, 
      nombreMascota, 
      especie, 
      fechaCita, 
      horaCita, 
      notas,
      doctorId  // Opcional, si quieres asignar doctor desde el frontend
    } = req.body;
    
    // Verificar si ya existe por teléfono
    let clienteExistente = await Cliente.findOne({ phoneNumber });
    
    if (clienteExistente) {
      // Si ya existe, solo agregar la cita temporal
      const nuevaCitaTemporal = {
        fecha: fechaCita,
        horaInicio: horaCita,
        horaFin: horaCita, // Asumiendo hora de 1 hora
        notas: notas || '',
        doctorId: doctorId || null,
        pacienteTemporal: {
          nombre: nombreMascota,
          especie: especie
        },
        creadaEn: new Date()
      };
      
      clienteExistente.citasTemporales = clienteExistente.citasTemporales || [];
      clienteExistente.citasTemporales.push(nuevaCitaTemporal);
      await clienteExistente.save();
      
      return res.status(200).json({
        message: 'Cita temporal agregada a cliente existente',
        cliente: clienteExistente,
        esNuevo: false
      });
    }
    
    // Crear nuevo cliente temporal
    const nuevoCliente = new Cliente({
      username,
      phoneNumber,
      email: email || null,
      estado: 'temporal',
      citasTemporales: [{
        fecha: fechaCita,
        horaInicio: horaCita,
        horaFin: horaCita,
        notas: notas || '',
        doctorId: doctorId || null,
        pacienteTemporal: {
          nombre: nombreMascota,
          especie: especie
        },
        creadaEn: new Date()
      }]
    });
    
    await nuevoCliente.save();
    res.status(201).json({
      message: 'Cliente temporal y cita creados exitosamente',
      cliente: nuevoCliente,
      esNuevo: true
    });
    
  } catch (error) {
    console.error('Error en createClienteTemporal:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// COMPLETAR REGISTRO DE CLIENTE TEMPORAL
// (Convertir temporal → completo)
// ============================================
export const completarRegistroClienteTemporal = async (req, res) => {
  try {
    const { id } = req.params;
    const { lastname, cedula, direccion, email, password } = req.body;
    
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    if (cliente.estado === 'completo') {
      return res.status(400).json({ message: 'El cliente ya está registrado completamente' });
    }
    
    // Verificar si el email ya está en uso por otro cliente
    if (email) {
      const emailExistente = await Cliente.findOne({ 
        email, 
        _id: { $ne: id } 
      });
      if (emailExistente) {
        return res.status(400).json({ message: 'El email ya está registrado' });
      }
      cliente.email = email;
    }
    
    // Completar datos faltantes
    cliente.lastname = lastname || '';
    cliente.cedula = cedula || '';
    cliente.direccion = direccion || '';
    cliente.estado = 'completo';
    
    // Crear hash de contraseña si se proporcionó
    if (password) {
      const salt = await bcrypt.genSalt(10);
      cliente.password = await bcrypt.hash(password, salt);
    }
    
    await cliente.save();
    
    res.json({ 
      message: 'Cliente registrado completamente',
      cliente: {
        _id: cliente._id,
        username: cliente.username,
        lastname: cliente.lastname,
        email: cliente.email,
        phoneNumber: cliente.phoneNumber,
        estado: cliente.estado
      }
    });
    
  } catch (error) {
    console.error('Error en completarRegistroClienteTemporal:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// ELIMINAR CLIENTE TEMPORAL
// ============================================
export const deleteClienteTemporal = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    // Solo permitir eliminar clientes temporales o incompletos
    if (cliente.estado === 'completo') {
      return res.status(400).json({ message: 'No se puede eliminar un cliente registrado' });
    }
    
    await cliente.deleteOne();
    res.json({ message: 'Cliente temporal eliminado exitosamente' });
    
  } catch (error) {
    console.error('Error en deleteClienteTemporal:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// CONVERTIR CITA TEMPORAL A CITA REAL
// ============================================
export const convertirCitaTemporal = async (req, res) => {
  try {
    const { clienteId, citaTemporalIndex } = req.params;
    const { doctorId, fecha, horaInicio, horaFin, pacienteId } = req.body;
    
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    const citaTemporal = cliente.citasTemporales[citaTemporalIndex];
    if (!citaTemporal) {
      return res.status(404).json({ message: 'Cita temporal no encontrada' });
    }
    
    // Aquí convertirías la cita temporal a una cita real
    // usando tu modelo de Citas
    
    // Marcar la cita temporal como convertida o eliminarla
    cliente.citasTemporales.splice(citaTemporalIndex, 1);
    await cliente.save();
    
    res.json({ message: 'Cita temporal convertida exitosamente' });
    
  } catch (error) {
    console.error('Error en convertirCitaTemporal:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// OBTENER CITAS TEMPORALES DE UN CLIENTE
// ============================================
export const getCitasTemporalesByCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json(cliente.citasTemporales || []);
    
  } catch (error) {
    console.error('Error en getCitasTemporalesByCliente:', error);
    res.status(500).json({ message: error.message });
  }
};