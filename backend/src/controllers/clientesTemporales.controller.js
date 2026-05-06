import bcrypt from 'bcryptjs';
import Owner from '../models/owner.model.js';
import { sendWelcomeEmail } from '../services/authService.js';

// ============================================
// OBTENER TODOS LOS CLIENTES TEMPORALES
// ============================================
export const getClientesTemporales = async (req, res) => {
  try {
    console.log('\n========== GET CLIENTES TEMPORALES ==========');
    
    // Primero, mostrar todos los clientes para depurar
    const todos = await Owner.find({});
    console.log(`📊 TOTAL CLIENTES EN BD: ${todos.length}`);
    todos.forEach(c => {
      console.log(`   - ${c.username}: estado=${c.estado}, citasTemporales=${c.citasTemporales?.length || 0}, tel=${c.phoneNumber}, email=${c.email || 'sin email'}, cedula=${c.cedula || 'sin cedula'}`);
    });
    
    const clientes = await Owner.find({ 
      estado: { $in: ['temporal', 'incompleto'] } 
    }).sort({ createdAt: -1 });
    
    console.log(`📊 Clientes con estado temporal/incompleto: ${clientes.length}`);
    
    // Formatear respuesta para que siempre tenga citasTemporales
    const clientesFormateados = clientes.map(cliente => ({
      _id: cliente._id,
      username: cliente.username,
      lastname: cliente.lastname || '',
      phoneNumber: cliente.phoneNumber,
      email: cliente.email || '',
      cedula: cliente.cedula || '',
      estado: cliente.estado,
      citasTemporales: cliente.citasTemporales || [],
      createdAt: cliente.createdAt
    }));
    
    console.log(`📊 Enviando ${clientesFormateados.length} clientes temporales`);
    console.log('========== FIN GET ==========\n');
    res.json(clientesFormateados);
  } catch (error) {
    console.error('❌ Error en getClientesTemporales:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// OBTENER CLIENTE TEMPORAL POR ID
// ============================================
export const getClienteTemporalById = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Owner.findById(id);
    
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
      cedula: cliente.cedula || '',
      estado: cliente.estado,
      citasTemporales: cliente.citasTemporales || [],
      createdAt: cliente.createdAt
    });
  } catch (error) {
    console.error('❌ Error en getClienteTemporalById:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// CREAR CLIENTE TEMPORAL
// ============================================
export const createClienteTemporal = async (req, res) => {
  try {
    console.log('\n========== CREATE CLIENTE TEMPORAL ==========');
    
    const { 
      username, 
      lastname, 
      phoneNumber, 
      email, 
      cedula,
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
    
    console.log('📝 Datos recibidos:', {
      username,
      email,
      cedula,
      phoneNumber,
      nombreMascota,
      fechaCita,
      horaInicio
    });
    
    // ✅ Validar campos requeridos
    if (!username) {
      return res.status(400).json({ message: 'El nombre es requerido', field: 'username' });
    }
    if (!email) {
      return res.status(400).json({ message: 'El correo electrónico es requerido', field: 'email' });
    }
    if (!cedula) {
      return res.status(400).json({ message: 'La cédula es requerida', field: 'cedula' });
    }
    if (!phoneNumber) {
      return res.status(400).json({ message: 'El teléfono es requerido', field: 'phoneNumber' });
    }
    if (!nombreMascota) {
      return res.status(400).json({ message: 'El nombre de la mascota es requerido', field: 'nombreMascota' });
    }
    
    // ✅ Verificar si ya existe un cliente con el mismo EMAIL
    const emailExistente = await Owner.findOne({ email });
    if (emailExistente) {
      console.log(`⚠️ Email ya registrado: ${email}`);
      return res.status(400).json({ 
        message: 'Ya existe un cliente registrado con este email',
        field: 'email'
      });
    }
    
    // ✅ Verificar si ya existe un cliente con la misma CÉDULA
    const cedulaExistente = await Owner.findOne({ cedula });
    if (cedulaExistente) {
      console.log(`⚠️ Cédula ya registrada: ${cedula}`);
      return res.status(400).json({ 
        message: 'Ya existe un cliente registrado con esta cédula',
        field: 'cedula'
      });
    }
    
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
    
    // ✅ Crear nuevo cliente temporal con email y cédula
    const nuevoCliente = new Owner({
      username,
      lastname: lastname || '',
      phoneNumber,
      email: email,
      cedula: cedula,
      estado: 'temporal',
      citasTemporales: [nuevaCitaTemporal]
    });
    
    await nuevoCliente.save();
    
    console.log(`✅ Cliente NUEVO creado:`);
    console.log(`   - ID: ${nuevoCliente._id}`);
    console.log(`   - Nombre: ${nuevoCliente.username}`);
    console.log(`   - Email: ${nuevoCliente.email}`);
    console.log(`   - Cédula: ${nuevoCliente.cedula}`);
    console.log(`   - Estado: ${nuevoCliente.estado}`);
    console.log(`   - Total citas temporales: ${nuevoCliente.citasTemporales?.length || 0}`);
    
    const respuesta = {
      message: 'Cliente temporal y cita creados exitosamente',
      cliente: {
        _id: nuevoCliente._id,
        username: nuevoCliente.username,
        lastname: nuevoCliente.lastname || '',
        phoneNumber: nuevoCliente.phoneNumber,
        email: nuevoCliente.email,
        cedula: nuevoCliente.cedula,
        estado: nuevoCliente.estado,
        citasTemporales: nuevoCliente.citasTemporales || [],
        createdAt: nuevoCliente.createdAt
      }
    };
    
    console.log('========== FIN CREATE ==========\n');
    res.status(201).json(respuesta);
    
  } catch (error) {
    console.error('❌ Error en createClienteTemporal:', error);
    
    // Manejar errores de duplicados
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({ 
          message: 'Ya existe un cliente registrado con este email',
          field: 'email'
        });
      }
      if (error.keyPattern?.cedula) {
        return res.status(400).json({ 
          message: 'Ya existe un cliente registrado con esta cédula',
          field: 'cedula'
        });
      }
    }
    
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// COMPLETAR REGISTRO DE CLIENTE TEMPORAL
// ============================================
export const completarRegistroClienteTemporal = async (req, res) => {
  try {
    const { id } = req.params;
    const { lastname, cedula, direccion, email } = req.body;
    
    console.log(`\n========== COMPLETAR REGISTRO ==========`);
    console.log(`📝 Cliente ID: ${id}`);
    console.log(`📝 Datos:`, { lastname, cedula, direccion, email });
    
    const cliente = await Owner.findById(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    if (cliente.estado === 'completo') {
      return res.status(400).json({ message: 'El cliente ya está registrado completamente' });
    }
    
    // Validar campos requeridos
    if (!email) {
      return res.status(400).json({ message: 'El email es requerido', field: 'email' });
    }
    if (!cedula) {
      return res.status(400).json({ message: 'La cédula es requerida', field: 'cedula' });
    }
    if (!lastname) {
      return res.status(400).json({ message: 'El apellido es requerido', field: 'lastname' });
    }
    if (!direccion) {
      return res.status(400).json({ message: 'La dirección es requerida', field: 'direccion' });
    }
    
    // ✅ Verificar si el email ya está en uso por OTRO cliente
    const emailExistente = await Owner.findOne({ 
      email, 
      _id: { $ne: id }
    });
    if (emailExistente) {
      return res.status(400).json({ 
        message: 'El email ya está registrado por otro usuario',
        field: 'email'
      });
    }
    
    // ✅ Verificar si la cédula ya está en uso por OTRO cliente
    const cedulaExistente = await Owner.findOne({ 
      cedula, 
      _id: { $ne: id }
    });
    if (cedulaExistente) {
      return res.status(400).json({ 
        message: 'La cédula ya está registrada por otro usuario',
        field: 'cedula'
      });
    }
    
    // Completar datos
    cliente.lastname = lastname;
    cliente.cedula = cedula;
    cliente.direccion = direccion;
    cliente.email = email;
    cliente.estado = 'completo';
    
    // Asignar contraseña por defecto si no tiene
    const DEFAULT_PASSWORD = "veterinaria123";
    let contrasenaAsignada = false;
    
    if (!cliente.password) {
      const salt = await bcrypt.genSalt(10);
      cliente.password = await bcrypt.hash(DEFAULT_PASSWORD, salt);
      contrasenaAsignada = true;
    }
    
    await cliente.save();
    
    console.log(`✅ Cliente ${cliente.username} completado exitosamente`);
    console.log(`   - Email: ${cliente.email}`);
    console.log(`   - Cédula: ${cliente.cedula}`);
    console.log(`   - Estado: ${cliente.estado}`);
    
    // Enviar correo de bienvenida
    if (contrasenaAsignada && cliente.email) {
      try {
        await sendWelcomeEmail(cliente.email, cliente.username, DEFAULT_PASSWORD);
        console.log(`📧 Correo de bienvenida enviado a: ${cliente.email}`);
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError.message);
      }
    }
    
    res.json({ 
      message: contrasenaAsignada 
        ? 'Cliente registrado completamente. Se ha enviado un correo con las credenciales de acceso.'
        : 'Cliente registrado completamente',
      cliente: {
        _id: cliente._id,
        username: cliente.username,
        lastname: cliente.lastname,
        email: cliente.email,
        phoneNumber: cliente.phoneNumber,
        cedula: cliente.cedula,
        direccion: cliente.direccion,
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
    const cliente = await Owner.findById(id);
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
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
    
    const cliente = await Owner.findById(clienteId);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    const citaTemporal = cliente.citasTemporales[citaTemporalIndex];
    if (!citaTemporal) {
      return res.status(404).json({ message: 'Cita temporal no encontrada' });
    }
    
    if (cliente.estado !== 'completo') {
      return res.status(400).json({ message: 'El cliente debe completar su registro primero' });
    }
    
    // Marcar la cita temporal como convertida o eliminarla
    cliente.citasTemporales.splice(citaTemporalIndex, 1);
    await cliente.save();
    
    res.json({ message: 'Cita temporal convertida exitosamente' });
    
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
    const cliente = await Owner.findById(id).populate('citasTemporales.doctorId');
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json(cliente.citasTemporales || []);
    
  } catch (error) {
    console.error('❌ Error en getCitasTemporalesByCliente:', error);
    res.status(500).json({ message: error.message });
  }
};