import bcrypt from 'bcryptjs';
import Owner from '../models/owner.model.js';
import Cita from '../models/cita.model.js';
import Paciente from '../models/pacientes.model.js';
import { sendWelcomeEmail } from '../services/authService.js';


const validarEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

const validarTelefono = (telefono) => {
  const phoneRegex = /^\+\d{1,4}[0-9\s\-]{8,15}$/;
  return phoneRegex.test(telefono);
};

const validarCedula = (cedula) => {
  return /^\d{6,12}$/.test(cedula);
};

// ============================================
// OBTENER TODOS LOS CLIENTES TEMPORALES
// ============================================
export const getClientesTemporales = async (req, res) => {
  try {
    console.log('\n========== GET CLIENTES TEMPORALES ==========');
    
    const clientes = await Owner.find({ 
      estado: { $in: ['temporal', 'incompleto'] } 
    }).sort({ createdAt: -1 });
    
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
    res.json(clientesFormateados);
    
  } catch (error) {
    console.error('❌ Error en getClientesTemporales:', error);
    res.status(500).json({ message: 'Error al obtener clientes temporales' });
  }
};

// ============================================
// OBTENER CLIENTE TEMPORAL POR ID
// ============================================
export const getClienteTemporalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: 'ID de cliente no válido' });
    }
    
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
      direccion: cliente.direccion || '',
      estado: cliente.estado,
      citasTemporales: cliente.citasTemporales || [],
      createdAt: cliente.createdAt
    });
    
  } catch (error) {
    console.error('❌ Error en getClienteTemporalById:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de cliente no válido' });
    }
    
    res.status(500).json({ message: 'Error al obtener el cliente temporal' });
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
    
    // ============================================
    // VALIDACIONES
    // ============================================
    
    if (!username || username.trim() === '') {
      return res.status(400).json({ message: 'El nombre del dueño es requerido', field: 'username' });
    }
    
    if (!email || email.trim() === '') {
      return res.status(400).json({ message: 'El correo electrónico es requerido', field: 'email' });
    }
    
    if (!validarEmail(email)) {
      return res.status(400).json({ message: 'Ingrese un correo electrónico válido', field: 'email' });
    }
    
    if (!cedula || cedula.trim() === '') {
      return res.status(400).json({ message: 'La cédula es requerida', field: 'cedula' });
    }
    
    if (!validarCedula(cedula)) {
      return res.status(400).json({ message: 'La cédula debe contener solo números (6-12 dígitos)', field: 'cedula' });
    }
    
    if (!phoneNumber || phoneNumber.trim() === '') {
      return res.status(400).json({ message: 'El número de teléfono es requerido', field: 'phoneNumber' });
    }
    
    if (!validarTelefono(phoneNumber)) {
      return res.status(400).json({ message: 'El teléfono debe incluir código de país', field: 'phoneNumber' });
    }
    
    if (!nombreMascota || nombreMascota.trim() === '') {
      return res.status(400).json({ message: 'El nombre de la mascota es requerido', field: 'nombreMascota' });
    }
    
    if (!especie || especie.trim() === '') {
      return res.status(400).json({ message: 'La especie de la mascota es requerida', field: 'especie' });
    }
    
    if (!doctorId) {
      return res.status(400).json({ message: 'Debe seleccionar un veterinario', field: 'doctorId' });
    }
    
    if (!fechaCita) {
      return res.status(400).json({ message: 'La fecha de la cita es requerida', field: 'fechaCita' });
    }
    
    if (!horaInicio || !horaFin) {
      return res.status(400).json({ message: 'Debe seleccionar un horario disponible', field: 'horario' });
    }
    
    // ============================================
    // VERIFICAR UNICIDAD
    // ============================================
    
    const emailExistente = await Owner.findOne({ email: email.toLowerCase().trim() });
    if (emailExistente) {
      return res.status(400).json({ message: `El correo "${email}" ya está registrado`, field: 'email' });
    }
    
    const cedulaExistente = await Owner.findOne({ cedula: cedula.trim() });
    if (cedulaExistente) {
      return res.status(400).json({ message: `La cédula "${cedula}" ya está registrada`, field: 'cedula' });
    }
    
    // ============================================
    // 1. CREAR CLIENTE TEMPORAL (Owner)
    // ============================================
    
    const nuevoCliente = new Owner({
      username: username.trim(),
      lastname: lastname || '',
      phoneNumber: phoneNumber.trim(),
      email: email.toLowerCase().trim(),
      cedula: cedula.trim(),
      estado: 'temporal',
      citasTemporales: [{
        fecha: fechaCita,
        horaInicio,
        horaFin,
        notas: notas || '',
        doctorId: doctorId || null,
        tipoCita: tipoCita || 'consulta',
        sintomas: sintomas || '',
        tiempoSintomas: tiempoSintomas || '',
        pacienteTemporal: {
          nombre: nombreMascota.trim(),
          especie: especie
        },
        creadaEn: new Date()
      }]
    });
    
    await nuevoCliente.save();
    
    // ============================================
    // 2. CREAR CITA REAL (Appointment)
    // ============================================
    
    // Convertir fecha de DD/MM/YYYY a YYYY-MM-DD si es necesario
    let fechaFormateada = fechaCita;
    if (fechaCita.includes('/')) {
      const [dia, mes, año] = fechaCita.split('/');
      fechaFormateada = `${año}-${mes}-${dia}`;
    }
    
    const nuevaCita = new Cita({
      doctorId: doctorId,
      pacienteId: null,  // Se asignará al completar registro
      fecha: fechaFormateada,
      horaInicio: horaInicio,
      horaFin: horaFin,
      motivo: sintomas || '',
      notas: notas || '',
      tipoCita: tipoCita || 'consulta',
      estado: 'pendiente',
      // Datos adicionales para tu modelo Cita
      title: tipoCita === 'consulta' ? 'Consulta médica' : 'Estética',
      pet: null,  // Se asignará al completar registro
      owner: nuevoCliente._id,
      veterinarian: doctorId,
      userId: doctorId,
      owner: nuevoCliente._id,        // ← AGREGAR: referencia al dueño
  veterinarian: doctorId,  
      duration: calcularDuracion(horaInicio, horaFin),
        esCitaTemporal: true 
    });
    
    const citaGuardada = await nuevaCita.save();
    
    // Guardar referencia de la cita en el cliente temporal
    nuevoCliente.citasTemporales[0].citaRealId = citaGuardada._id;
    await nuevoCliente.save();
    
    console.log(`✅ Cliente temporal creado: ${nuevoCliente.username}`);
    console.log(`✅ Cita creada: ${citaGuardada._id}`);
    
    res.status(201).json({
      message: '✅ Cliente temporal y cita creados exitosamente',
      cliente: {
        _id: nuevoCliente._id,
        username: nuevoCliente.username,
        email: nuevoCliente.email,
        cedula: nuevoCliente.cedula,
        estado: nuevoCliente.estado
      },
      cita: {
        _id: citaGuardada._id,
        fecha: citaGuardada.fecha,
        horaInicio: citaGuardada.horaInicio,
        horaFin: citaGuardada.horaFin
      }
    });
    
  } catch (error) {
    console.error('❌ Error en createClienteTemporal:', error);
    
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({ message: 'Este correo electrónico ya está registrado', field: 'email' });
      }
      if (error.keyPattern?.cedula) {
        return res.status(400).json({ message: 'Esta cédula ya está registrada', field: 'cedula' });
      }
    }
    
    res.status(500).json({ message: error.message });
  }
};

// Función auxiliar para calcular duración
function calcularDuracion(horaInicio, horaFin) {
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  const minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
  return minutos;
}
// ============================================
// COMPLETAR REGISTRO DE CLIENTE TEMPORAL
// ============================================
export const completarRegistroClienteTemporal = async (req, res) => {
  try {
    const { id } = req.params;
    const { lastname, cedula, direccion, email } = req.body;
    
    console.log(`\n========== COMPLETAR REGISTRO ==========`);
    console.log(`📝 Cliente ID: ${id}`);
    
    // Validaciones básicas
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: 'ID de cliente no válido' });
    }
    
    const cliente = await Owner.findById(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    if (cliente.estado === 'completo') {
      return res.status(400).json({ message: 'Este cliente ya está registrado completamente' });
    }
    
    // Validar campos requeridos
    if (!email) return res.status(400).json({ message: 'El email es requerido', field: 'email' });
    if (!validarEmail(email)) return res.status(400).json({ message: 'Email inválido', field: 'email' });
    if (!cedula) return res.status(400).json({ message: 'La cédula es requerida', field: 'cedula' });
    if (!validarCedula(cedula)) return res.status(400).json({ message: 'Cédula inválida (6-12 dígitos)', field: 'cedula' });
    if (!lastname) return res.status(400).json({ message: 'El apellido es requerido', field: 'lastname' });
    if (!direccion) return res.status(400).json({ message: 'La dirección es requerida', field: 'direccion' });
    
    // Verificar unicidad
    const emailExistente = await Owner.findOne({ email, _id: { $ne: id } });
    if (emailExistente) return res.status(400).json({ message: 'Email ya registrado', field: 'email' });
    
    const cedulaExistente = await Owner.findOne({ cedula, _id: { $ne: id } });
    if (cedulaExistente) return res.status(400).json({ message: 'Cédula ya registrada', field: 'cedula' });
    
    // ============================================
    // 1. CREAR MASCOTA (Paciente / Pet)
    // ============================================
    const citaTemporal = cliente.citasTemporales?.[0];
    let mascotaId = null;
    
    if (citaTemporal && citaTemporal.pacienteTemporal) {
      const nuevaMascota = new Paciente({
        name: citaTemporal.pacienteTemporal.nombre,
        species: citaTemporal.pacienteTemporal.especie,
        owner: cliente._id,
        userId: cliente._id,
        status: 'active'
        // Otros campos opcionales se pueden agregar después
      });
      
      const mascotaGuardada = await nuevaMascota.save();
      mascotaId = mascotaGuardada._id;
      console.log(`✅ Mascota creada: ${mascotaGuardada.name} (ID: ${mascotaGuardada._id})`);
    }
    
    // ============================================
    // 2. ACTUALIZAR CITA REAL (Appointment)
    // ============================================
    let citaActualizada = null;
    
    if (citaTemporal && citaTemporal.citaRealId) {
      const citaReal = await Cita.findById(citaTemporal.citaRealId);
      if (citaReal) {
        citaReal.pacienteId = mascotaId;
        citaReal.pet = mascotaId;
        citaReal.owner = cliente._id;
        citaReal.estado = 'confirmada';
            citaReal.esCitaTemporal = false; 
        citaReal.status = 'scheduled';
        await citaReal.save();
        citaActualizada = citaReal;
        console.log(`✅ Cita actualizada: ${citaReal._id} con mascota: ${mascotaId}`);
      }
    }
    
    // ============================================
    // 3. COMPLETAR CLIENTE (Owner)
    // ============================================
    cliente.lastname = lastname.trim();
    cliente.cedula = cedula.trim();
    cliente.direccion = direccion.trim();
    cliente.email = email.toLowerCase().trim();
    cliente.estado = 'completo';
    if (mascotaId) {
      cliente.mascotaId = mascotaId;
    }
    
    // Asignar contraseña por defecto
    const DEFAULT_PASSWORD = "veterinaria123";
    let contrasenaAsignada = false;
    
    if (!cliente.password) {
      const salt = await bcrypt.genSalt(10);
      cliente.password = await bcrypt.hash(DEFAULT_PASSWORD, salt);
      contrasenaAsignada = true;
    }
    
    await cliente.save();
    
    // Enviar correo de bienvenida
    if (contrasenaAsignada && cliente.email) {
      try {
        await sendWelcomeEmail(cliente.email, cliente.username, DEFAULT_PASSWORD);
        console.log(`📧 Correo enviado a: ${cliente.email}`);
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError.message);
      }
    }
    
    console.log(`✅ Cliente completado: ${cliente.username}`);
    
    res.json({
      message: contrasenaAsignada
        ? '✅ Registro completado. Se ha enviado un correo con las credenciales de acceso.'
        : '✅ Registro completado exitosamente',
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
    
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: 'ID de cliente no válido' });
    }
    
    const cliente = await Owner.findById(id);
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    if (cliente.estado === 'completo') {
      return res.status(400).json({ message: 'No se puede eliminar un cliente ya registrado' });
    }
    
    await cliente.deleteOne();
    console.log(`🗑️ Cliente temporal eliminado: ${cliente.username}`);
    
    res.json({ message: 'Cliente temporal eliminado exitosamente' });
    
  } catch (error) {
    console.error('❌ Error en deleteClienteTemporal:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de cliente no válido' });
    }
    
    res.status(500).json({ message: 'Error al eliminar el cliente temporal' });
  }
};

// ============================================
// CONVERTIR CITA TEMPORAL A CITA REAL
// ============================================
export const convertirCitaTemporal = async (req, res) => {
  try {
    const { clienteId, citaTemporalIndex } = req.params;
    
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
    
    cliente.citasTemporales.splice(citaTemporalIndex, 1);
    await cliente.save();
    
    res.json({ message: 'Cita temporal convertida exitosamente' });
    
  } catch (error) {
    console.error('❌ Error en convertirCitaTemporal:', error);
    res.status(500).json({ message: 'Error al convertir la cita temporal' });
  }
};

// ============================================
// OBTENER CITAS TEMPORALES DE UN CLIENTE
// ============================================
export const getCitasTemporalesByCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Owner.findById(id).populate('citasTemporales.doctorId', 'username lastname especialidad');
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json(cliente.citasTemporales || []);
    
  } catch (error) {
    console.error('❌ Error en getCitasTemporalesByCliente:', error);
    res.status(500).json({ message: 'Error al obtener las citas temporales' });
  }
};