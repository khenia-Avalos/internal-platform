import bcrypt from 'bcryptjs';
import Cliente from '../models/owner.model.js';

// ============================================
// OBTENER TODOS LOS CLIENTES TEMPORALES
// ============================================
export const getClientesTemporales = async (req, res) => {
  try {
    console.log('\n========== GET CLIENTES TEMPORALES ==========');
    
    // Primero, mostrar todos los clientes para depurar
    const todos = await Cliente.find({});
    console.log(`📊 TOTAL CLIENTES EN BD: ${todos.length}`);
    todos.forEach(c => {
      console.log(`   - ${c.username}: estado=${c.estado}, citasTemporales=${c.citasTemporales?.length || 0}, tel=${c.phoneNumber}`);
    });
    
    const clientes = await Cliente.find({ 
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
// ============================================
// CREAR CLIENTE TEMPORAL (AGENDAMIENTO RÁPIDO)
// ============================================
export const createClienteTemporal = async (req, res) => {
  try {
    console.log('\n========== CREATE CLIENTE TEMPORAL ==========');
    
    const { 
      username, 
      lastname, 
      phoneNumber, 
      email, 
      cedula,           // ← NUEVO: cédula como identificador
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
      cedula,
      phoneNumber,
      nombreMascota,
      fechaCita,
      horaInicio
    });
    
    // 🔍 Verificar si ya existe un cliente con la misma CÉDULA
    let clienteExistente = null;
    
    if (cedula) {
      clienteExistente = await Cliente.findOne({ cedula });
      
      if (clienteExistente) {
        console.log(`🔍 Cliente existente encontrado por CÉDULA:`);
        console.log(`   - ID: ${clienteExistente._id}`);
        console.log(`   - Nombre: ${clienteExistente.username}`);
        console.log(`   - Estado actual: ${clienteExistente.estado}`);
        console.log(`   - Cédula: ${clienteExistente.cedula}`);
      }
    }
    
    // Si no encontró por cédula, verificar por teléfono (opcional, como advertencia)
    if (!clienteExistente && phoneNumber) {
      const clientePorTelefono = await Cliente.findOne({ phoneNumber });
      if (clientePorTelefono) {
        console.log(`⚠️ Advertencia: El teléfono ${phoneNumber} ya pertenece a ${clientePorTelefono.username} (cédula: ${clientePorTelefono.cedula})`);
        // No bloqueamos, solo advertimos
      }
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
    
    let cliente;
    let esNuevo = false;
    
    if (clienteExistente) {
      // Si ya existe por cédula, agregar la cita temporal
      clienteExistente.citasTemporales = clienteExistente.citasTemporales || [];
      clienteExistente.citasTemporales.push(nuevaCitaTemporal);
      await clienteExistente.save();
      cliente = clienteExistente;
      esNuevo = false;
      console.log(`📝 Cita temporal AGREGADA a cliente existente: ${clienteExistente.username}`);
    } else {
      // Validar que la cédula no esté vacía
      if (!cedula) {
        return res.status(400).json({ 
          message: 'La cédula es requerida para crear un cliente temporal',
          field: 'cedula'
        });
      }
      
      // Crear nuevo cliente temporal
      const nuevoCliente = new Cliente({
        username,
        lastname: lastname || '',
        phoneNumber,
        email: email || null,
        cedula,  // ← Guardamos la cédula
        estado: 'temporal',
        citasTemporales: [nuevaCitaTemporal]
      });
      await nuevoCliente.save();
      cliente = nuevoCliente;
      esNuevo = true;
      console.log(`📝 Cliente NUEVO creado: ${username} (cédula: ${cedula}, estado: temporal)`);
    }
    
    // Obtener el cliente actualizado
    const clienteActualizado = await Cliente.findById(cliente._id);
    
    console.log(`✅ Resultado final:`);
    console.log(`   - ID: ${clienteActualizado._id}`);
    console.log(`   - Nombre: ${clienteActualizado.username}`);
    console.log(`   - Cédula: ${clienteActualizado.cedula}`);
    console.log(`   - Estado: ${clienteActualizado.estado}`);
    console.log(`   - Total citas temporales: ${clienteActualizado.citasTemporales?.length || 0}`);
    
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
        cedula: clienteActualizado.cedula,
        estado: clienteActualizado.estado,
        citasTemporales: clienteActualizado.citasTemporales || [],
        createdAt: clienteActualizado.createdAt
      },
      esNuevo
    };
    
    console.log('========== FIN CREATE ==========\n');
    res.status(201).json(respuesta);
    
  } catch (error) {
    console.error('❌ Error en createClienteTemporal:', error);
    // Manejar error de cédula duplicada
    if (error.code === 11000 && error.keyPattern?.cedula) {
      return res.status(400).json({ 
        message: 'Ya existe un cliente registrado con esta cédula',
        field: 'cedula'
      });
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
    const { lastname, cedula, direccion, email, password } = req.body;
    
    console.log(`\n========== COMPLETAR REGISTRO ==========`);
    console.log(`📝 Completando registro para cliente ID: ${id}`);
    
    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    console.log(`📝 Cliente encontrado: ${cliente.username}, estado actual: ${cliente.estado}`);
    
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
    
    console.log(`✅ Cliente ${cliente.username} completado exitosamente, nuevo estado: ${cliente.estado}`);
    console.log('========== FIN COMPLETAR ==========\n');
    
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