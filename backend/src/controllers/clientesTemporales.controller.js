import bcrypt from 'bcryptjs';
import Owner from '../models/owner.model.js';
import Cita from '../models/cita.model.js';
import Paciente from '../models/paciente.model.js';
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
    // VALIDACIONES ESPECÍFICAS
    // ============================================
    
    // 1. Validar nombre
    if (!username || username.trim() === '') {
      return res.status(400).json({ 
        message: 'El nombre del dueño es requerido',
        field: 'username'
      });
    }
    
    // 2. Validar email
    if (!email || email.trim() === '') {
      return res.status(400).json({ 
        message: 'El correo electrónico es requerido',
        field: 'email'
      });
    }
    
    if (!validarEmail(email)) {
      return res.status(400).json({ 
        message: 'Ingrese un correo electrónico válido (ejemplo: usuario@dominio.com)',
        field: 'email'
      });
    }
    
    // 3. Validar cédula
    if (!cedula || cedula.trim() === '') {
      return res.status(400).json({ 
        message: 'La cédula es requerida',
        field: 'cedula'
      });
    }
    
    if (!validarCedula(cedula)) {
      return res.status(400).json({ 
        message: 'La cédula debe contener solo números (6-12 dígitos)',
        field: 'cedula'
      });
    }
    
    // 4. Validar teléfono
    if (!phoneNumber || phoneNumber.trim() === '') {
      return res.status(400).json({ 
        message: 'El número de teléfono es requerido',
        field: 'phoneNumber'
      });
    }
    
    if (!validarTelefono(phoneNumber)) {
      return res.status(400).json({ 
        message: 'El teléfono debe incluir código de país. Ejemplos: +50676486781 o +506 7098 3832',
        field: 'phoneNumber'
      });
    }
    
    // 5. Validar nombre de mascota
    if (!nombreMascota || nombreMascota.trim() === '') {
      return res.status(400).json({ 
        message: 'El nombre de la mascota es requerido',
        field: 'nombreMascota'
      });
    }
    
    // 6. Validar especie
    if (!especie || especie.trim() === '') {
      return res.status(400).json({ 
        message: 'La especie de la mascota es requerida',
        field: 'especie'
      });
    }
    
    // 7. Validar doctor
    if (!doctorId) {
      return res.status(400).json({ 
        message: 'Debe seleccionar un veterinario',
        field: 'doctorId'
      });
    }
    
    // 8. Validar fecha
    if (!fechaCita) {
      return res.status(400).json({ 
        message: 'La fecha de la cita es requerida',
        field: 'fechaCita'
      });
    }
    
    // 9. Validar horario
    if (!horaInicio || !horaFin) {
      return res.status(400).json({ 
        message: 'Debe seleccionar un horario disponible',
        field: 'horario'
      });
    }
    
    // ============================================
    // VALIDACIONES DE UNICIDAD
    // ============================================
    
    // Verificar email único
    const emailExistente = await Owner.findOne({ email: email.toLowerCase().trim() });
    if (emailExistente) {
      return res.status(400).json({ 
        message: `El correo "${email}" ya está registrado. Use otro email.`,
        field: 'email'
      });
    }
    
    // Verificar cédula única
    const cedulaExistente = await Owner.findOne({ cedula: cedula.trim() });
    if (cedulaExistente) {
      return res.status(400).json({ 
        message: `La cédula "${cedula}" ya está registrada. Verifique sus datos.`,
        field: 'cedula'
      });
    }
    
    // ============================================
    // CREAR CLIENTE TEMPORAL
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
    // CREAR CITA REAL (en colección Cita)
    // ============================================
    
    const nuevaCita = new Cita({
      doctorId: doctorId,
      pacienteId: null,  // Temporal, se asignará después
      fecha: fechaCita,
      horaInicio: horaInicio,
      horaFin: horaFin,
      motivo: sintomas || '',
      notas: notas || '',
      tipoCita: tipoCita || 'consulta',
      estado: 'pendiente',
      clienteTemporalId: nuevoCliente._id  // Referencia al cliente temporal
    });
    
    const citaGuardada = await nuevaCita.save();
    
    // Actualizar el cliente temporal con el ID de la cita real
    nuevoCliente.citasTemporales[0].citaRealId = citaGuardada._id;
    await nuevoCliente.save();
    
    console.log(`✅ Cliente temporal creado: ${nuevoCliente.username}`);
    console.log(`✅ Cita real creada: ${citaGuardada._id}`);
    
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
    
    // Manejar errores de duplicados de MongoDB
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({ 
          message: 'Este correo electrónico ya está registrado. Use otro email.',
          field: 'email'
        });
      }
      if (error.keyPattern?.cedula) {
        return res.status(400).json({ 
          message: 'Esta cédula ya está registrada. Verifique sus datos.',
          field: 'cedula'
        });
      }
    }
    
    // Error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: mensajes[0],
        field: Object.keys(error.errors)[0]
      });
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor. Intente nuevamente.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    
    // Validar ID
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: 'ID de cliente no válido' });
    }
    
    // Buscar cliente
    const cliente = await Owner.findById(id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    if (cliente.estado === 'completo') {
      return res.status(400).json({ message: 'Este cliente ya está registrado completamente' });
    }
    
    // ============================================
    // VALIDACIONES
    // ============================================
    
    if (!email || email.trim() === '') {
      return res.status(400).json({ 
        message: 'El correo electrónico es requerido',
        field: 'email'
      });
    }
    
    if (!validarEmail(email)) {
      return res.status(400).json({ 
        message: 'Ingrese un correo electrónico válido',
        field: 'email'
      });
    }
    
    if (!cedula || cedula.trim() === '') {
      return res.status(400).json({ 
        message: 'La cédula es requerida',
        field: 'cedula'
      });
    }
    
    if (!validarCedula(cedula)) {
      return res.status(400).json({ 
        message: 'La cédula debe contener solo números (6-12 dígitos)',
        field: 'cedula'
      });
    }
    
    if (!lastname || lastname.trim() === '') {
      return res.status(400).json({ 
        message: 'El apellido es requerido',
        field: 'lastname'
      });
    }
    
    if (!direccion || direccion.trim() === '') {
      return res.status(400).json({ 
        message: 'La dirección es requerida',
        field: 'direccion'
      });
    }
    
    // ============================================
    // VERIFICAR UNICIDAD
    // ============================================
    
    // Verificar email único (excluyendo el cliente actual)
    const emailExistente = await Owner.findOne({ 
      email: email.toLowerCase().trim(), 
      _id: { $ne: id }
    });
    
    if (emailExistente) {
      return res.status(400).json({ 
        message: `El correo "${email}" ya está registrado por otro usuario`,
        field: 'email'
      });
    }
    
    // Verificar cédula única (excluyendo el cliente actual)
    const cedulaExistente = await Owner.findOne({ 
      cedula: cedula.trim(), 
      _id: { $ne: id }
    });
    
    if (cedulaExistente) {
      return res.status(400).json({ 
        message: `La cédula "${cedula}" ya está registrada por otro usuario`,
        field: 'cedula'
      });
    }
    
    // ============================================
    // 1. CREAR MASCOTA (Paciente)
    // ============================================
    
    // Obtener la primera cita temporal para los datos de la mascota
    const citaTemporal = cliente.citasTemporales?.[0];
    let mascotaId = null;
    
    if (citaTemporal && citaTemporal.pacienteTemporal) {
      const nuevaMascota = new Paciente({
        nombre: citaTemporal.pacienteTemporal.nombre,
        especie: citaTemporal.pacienteTemporal.especie,
        ownerId: cliente._id,
        edad: null,
        sexo: null,
        raza: null
      });
      
      const mascotaGuardada = await nuevaMascota.save();
      mascotaId = mascotaGuardada._id;
      console.log(`✅ Mascota creada: ${mascotaGuardada.nombre} (ID: ${mascotaGuardada._id})`);
      
      // ============================================
      // 2. ACTUALIZAR LA CITA REAL CON EL PACIENTE
      // ============================================
      if (citaTemporal.citaRealId) {
        const citaReal = await Cita.findById(citaTemporal.citaRealId);
        if (citaReal) {
          citaReal.pacienteId = mascotaGuardada._id;
          citaReal.estado = 'confirmada';
          await citaReal.save();
          console.log(`✅ Cita actualizada: ${citaReal._id} con pacienteId: ${mascotaGuardada._id}`);
        } else {
          console.log(`⚠️ No se encontró la cita real con ID: ${citaTemporal.citaRealId}`);
        }
      }
    } else {
      console.log('⚠️ No hay cita temporal o paciente temporal asociado');
    }
    
    // ============================================
    // 3. ACTUALIZAR CLIENTE
    // ============================================
    
    cliente.lastname = lastname.trim();
    cliente.cedula = cedula.trim();
    cliente.direccion = direccion.trim();
    cliente.email = email.toLowerCase().trim();
    cliente.estado = 'completo';
    if (mascotaId) {
      cliente.mascotaId = mascotaId;
    }
    
    // Asignar contraseña por defecto si no tiene
    const DEFAULT_PASSWORD = "veterinaria123";
    let contrasenaAsignada = false;
    
    if (!cliente.password) {
      const salt = await bcrypt.genSalt(10);
      cliente.password = await bcrypt.hash(DEFAULT_PASSWORD, salt);
      contrasenaAsignada = true;
    }
    
    await cliente.save();
    
    console.log(`✅ Cliente completado: ${cliente.username}`);
    
    // Enviar correo de bienvenida
    if (contrasenaAsignada && cliente.email) {
      try {
        await sendWelcomeEmail(cliente.email, cliente.username, DEFAULT_PASSWORD);
        console.log(`📧 Correo enviado a: ${cliente.email}`);
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError.message);
      }
    }
    
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
    
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: mensajes[0] });
    }
    
    res.status(500).json({ 
      message: 'Error al completar el registro. Intente nuevamente.'
    });
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