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
    
    // Formatear respuesta para que siempre tenga citasTemporales
    const clientesFormateados = clientes.map(cliente => ({
      _id: cliente._id,
      username: cliente.username,
      lastname: cliente.lastname || '',
      phoneNumber: cliente.phoneNumber,
      email: cliente.email || '',
      estado: cliente.estado,
      citasTemporales: cliente.citasTemporales || [],
      createdAt: cliente.createdAt
    }));
    
    console.log(`📊 Enviando ${clientesFormateados.length} clientes temporales`);
    res.json(clientesFormateados);
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
    
    res.json({
      _id: cliente._id,
      username: cliente.username,
      lastname: cliente.lastname || '',
      phoneNumber: cliente.phoneNumber,
      email: cliente.email || '',
      estado: cliente.estado,
      citasTemporales: cliente.citasTemporales || [],
      createdAt: cliente.createdAt
    });
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
      lastname, 
      phoneNumber, 
      email, 
      nombreMascota, 
      especie, 
      fechaCita, 
      horaInicio, 
      horaFin, 
      doctorId, 
      tipoCita, 
      sintomas, 
      tiempoSintomas, 
      notas
    } = req.body;
    
    console.log('📝 Creando cliente temporal con datos:', {
      username,
      phoneNumber,
      nombreMascota,
      especie,
      fechaCita,
      horaInicio,
      horaFin,
      doctorId,
      tipoCita
    });
    
    // Verificar si ya existe por teléfono
    let clienteExistente = await Cliente.findOne({ phoneNumber });
    
    const nuevaCitaTemporal = {
      fecha: fechaCita,
      horaInicio: horaInicio,
      horaFin: horaFin,
      notas: notas || '',
      doctorId: doctorId || null,
      tipoCita: tipoCita || 'consulta',
      sintomas: sintomas || '',
      tiempoSintomas: tiempoSintomas || '',
      pacienteTemporal: {
        nombre: nombreMascota,
        especie: especie
      },
      creadaEn: new Date()
    };
    
    let cliente;
    let esNuevo = false;
    
    if (clienteExistente) {
      // Si ya existe, solo agregar la cita temporal
      console.log(`📝 Cliente existente encontrado: ${clienteExistente.username}`);
      clienteExistente.citasTemporales = clienteExistente.citasTemporales || [];
      clienteExistente.citasTemporales.push(nuevaCitaTemporal);
      await clienteExistente.save();
      cliente = clienteExistente;
      esNuevo = false;
    } else {
      // Crear nuevo cliente temporal
      console.log(`📝 Creando nuevo cliente temporal: ${username}`);
      const nuevoCliente = new Cliente({
        username,
        lastname: lastname || '',
        phoneNumber,
        email: email || null,
        estado: 'temporal',
        citasTemporales: [nuevaCitaTemporal]
      });
      await nuevoCliente.save();
      cliente = nuevoCliente;
      esNuevo = true;
    }
    
    // Obtener el cliente con todos sus datos actualizados
    const clienteActualizado = await Cliente.findById(cliente._id);
    
    const respuesta = {
      message: esNuevo 
        ? 'Cliente temporal y cita creados exitosamente' 
        : 'Cita temporal agregada a cliente existente',
      cliente: {
        _id: clienteActualizado._id,
        username: clienteActualizado.username,
        lastname: clienteActualizado.lastname || '',
        phoneNumber: clienteActualizado.phoneNumber,
        email: clienteActualizado.email || '',
        estado: clienteActualizado.estado,
        citasTemporales: clienteActualizado.citasTemporales || [],
        createdAt: clienteActualizado.createdAt
      },
      esNuevo
    };
    
    console.log(`✅ Cliente temporal guardado: ${username}`);
    res.status(201).json(respuesta);
    
  } catch (error) {
    console.error('❌ Error en createClienteTemporal:', error);
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
    
    console.log(`📝 Completando registro para cliente: ${id}`);
    
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
    
    console.log(`✅ Cliente ${cliente.username} completado exitosamente`);
    
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
    console.error('❌ Error en completarRegistroClienteTemporal:', error);
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
    console.log(`🗑️ Cliente temporal eliminado: ${cliente.username}`);
    res.json({ message: 'Cliente temporal eliminado exitosamente' });
    
  } catch (error) {
    console.error('❌ Error en deleteClienteTemporal:', error);
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
    
    // Verificar que el cliente ya completó su registro
    if (cliente.estado !== 'completo') {
      return res.status(400).json({ message: 'El cliente debe completar su registro primero' });
    }
    
    // Aquí importas tu modelo de Cita
    // const Cita = require('../models/cita.model.js');
    
    // Crear la cita real
    // const nuevaCita = new Cita({
    //   pacienteId: pacienteId,
    //   doctorId: citaTemporal.doctorId || doctorId,
    //   fecha: citaTemporal.fecha,
    //   horaInicio: citaTemporal.horaInicio,
    //   horaFin: citaTemporal.horaFin,
    //   tipoCita: citaTemporal.tipoCita,
    //   notas: citaTemporal.notas,
    //   estado: 'pendiente'
    // });
    // await nuevaCita.save();
    
    // Eliminar la cita temporal
    cliente.citasTemporales.splice(citaTemporalIndex, 1);
    await cliente.save();
    
    res.json({ 
      message: 'Cita temporal convertida exitosamente',
      // cita: nuevaCita 
    });
    
  } catch (error) {
    console.error('❌ Error en convertirCitaTemporal:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// OBTENER CITAS TEMPORALES DE UN CLIENTE
// ============================================
export const getCitasTemporalesByCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id).populate('citasTemporales.doctorId');
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json(cliente.citasTemporales || []);
    
  } catch (error) {
    console.error('❌ Error en getCitasTemporalesByCliente:', error);
    res.status(500).json({ message: error.message });
  }
};