import bcrypt from 'bcryptjs';
import Owner from '../models/owner.model.js';
import Cita from '../models/cita.model.js';
import Paciente from '../models/pacientes.model.js';
import { sendWelcomeEmail, sendAppointmentConfirmationEmail } from '../services/authService.js';
import { createAccessToken } from '../libs/jwt.js';
import { manejarError } from '../utils/errorHandler.js';


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
    
    console.log(`Enviando ${clientesFormateados.length} clientes temporales`);
    res.json(clientesFormateados);
    
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ message: errorResponse.message });
  }
};


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
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ message: errorResponse.message });
  }
};


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
    
    // VALIDACIONES
    
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
    
    // VERIFICAR UNICIDAD
    
    const emailExistente = await Owner.findOne({ email: email.toLowerCase().trim() });
    if (emailExistente) {
      return res.status(400).json({ message: `El correo "${email}" ya está registrado`, field: 'email' });
    }
    
    const cedulaExistente = await Owner.findOne({ cedula: cedula.trim() });
    if (cedulaExistente) {
      return res.status(400).json({ message: `La cédula "${cedula}" ya está registrada`, field: 'cedula' });
    }
    
    // 1. CREAR CLIENTE TEMPORAL (Owner)
    
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
    
    // 2. CREAR CITA REAL (Appointment)
    
    // Convertir fecha de DD/MM/YYYY a YYYY-MM-DD si es necesario
    let fechaFormateada = fechaCita;
    if (fechaCita.includes('/')) {
      const [dia, mes, año] = fechaCita.split('/');
      fechaFormateada = `${año}-${mes}-${dia}`;
    }
    
    const nuevaCita = new Cita({
      doctorId: doctorId,
      pacienteId: null,
      fecha: fechaFormateada,
      horaInicio: horaInicio,
      horaFin: horaFin,
      motivo: sintomas || '',
      notas: notas || '',
      tipoCita: tipoCita || 'consulta',
      estado: 'pendiente',
      title: tipoCita === 'consulta' ? 'Consulta médica' : 'Estética',
      owner: nuevoCliente._id,
      veterinarian: doctorId,
      duration: calcularDuracion(horaInicio, horaFin),
      esCitaTemporal: true,
      clienteTemporalId: nuevoCliente._id,
      pacienteTemporal: {
        nombre: nombreMascota.trim(),
        especie: especie
      }
    });
    
    const citaGuardada = await nuevaCita.save();
    console.log(`Cita creada: ${citaGuardada._id}`);
    
    // 3. GENERAR Y GUARDAR TOKEN (PRIMERO)
    
    const tokenConfirmacion = await createAccessToken({ id: citaGuardada._id }, "7d");
    citaGuardada.tokenConfirmacion = tokenConfirmacion;
    await citaGuardada.save();
    console.log("Token generado y guardado");
    
    // 4. BUSCAR CITA CON POPULATE (AHORA CON TOKEN)
    
    const citaConDatos = await Cita.findById(citaGuardada._id)
      .populate('doctorId', 'username lastname especialidad')
      .populate({
        path: 'pacienteId',
        populate: {
          path: 'ownerId',
          select: 'username email'
        }
      });
    
    // 5. ENVIAR CORREO DE CONFIRMACIÓN
    
    if (email) {
      console.log("Intentando enviar correo de confirmación a:", email);
      try {
        await sendAppointmentConfirmationEmail(
          email,
          username || "Cliente",
          citaConDatos
        );
        console.log("Correo de confirmación enviado exitosamente a:", email);
      } catch (emailError) {
        console.error("Error enviando correo de confirmación:", emailError.message);
      }
    }
    
    // 6. GUARDAR REFERENCIA DE LA CITA EN EL CLIENTE TEMPORAL
    
    nuevoCliente.citasTemporales[0].citaRealId = citaGuardada._id;
    await nuevoCliente.save();
    
    console.log(`Cliente temporal creado: ${nuevoCliente.username}`);
    
    // RESPUESTA
    
    res.status(201).json({
      message: 'Cliente temporal y cita creados exitosamente. Se ha enviado un correo de confirmación.',
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
    console.error('Error en createClienteTemporal:', error);
    
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({ message: 'Este correo electrónico ya está registrado', field: 'email' });
      }
      if (error.keyPattern?.cedula) {
        return res.status(400).json({ message: 'Esta cédula ya está registrada', field: 'cedula' });
      }
    }
    
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ message: errorResponse.message });
  }
};

// Función auxiliar para calcular duración
function calcularDuracion(horaInicio, horaFin) {
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  const minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
  return minutos;
}


export const completarRegistroClienteTemporal = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      lastname, cedula, direccion, email,
      raza, edad, sexo, colorPelaje, peso, temperatura, antecedentesMedicos 
    } = req.body;
    
    console.log(`\n COMPLETAR REGISTRO =`);
    console.log(`Cliente ID: ${id}`);
    console.log(`Datos recibidos:`, { lastname, cedula, direccion, email, raza, edad, sexo, colorPelaje, peso, temperatura });
    
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
    
    // VALIDACIONES DEL CLIENTE
    
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
    
    if (!lastname || lastname.trim() === '') {
      return res.status(400).json({ message: 'El apellido es requerido', field: 'lastname' });
    }
    
    if (!direccion || direccion.trim() === '') {
      return res.status(400).json({ message: 'La dirección es requerida', field: 'direccion' });
    }
    
    // VERIFICAR UNICIDAD
    
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
    
    // 1. CREAR MASCOTA (Paciente)
    
    const citaTemporal = cliente.citasTemporales?.[0];
    let mascotaId = null;
    
    if (citaTemporal && citaTemporal.pacienteTemporal) {
      
      // Validar datos de la mascota temporal
      if (!citaTemporal.pacienteTemporal.nombre) {
        return res.status(400).json({ 
          message: 'El nombre de la mascota es requerido',
          field: 'nombreMascota'
        });
      }
      
      if (!citaTemporal.pacienteTemporal.especie) {
        return res.status(400).json({ 
          message: 'La especie de la mascota es requerida',
          field: 'especie'
        });
      }
      
      // Normalizar especie (asegurar minúsculas para el enum)
      let especieNormalizada = citaTemporal.pacienteTemporal.especie.toLowerCase();
      const especiesValidas = ['perro', 'gato', 'ave', 'conejo', 'otro'];
      if (!especiesValidas.includes(especieNormalizada)) {
        especieNormalizada = 'otro';
      }
      
      // Normalizar sexo (convertir a Macho / Hembra con mayúscula)
      let sexoNormalizado = '';
      if (sexo) {
        const sexoLower = sexo.toLowerCase();
        if (sexoLower === 'macho') {
          sexoNormalizado = 'Macho';
        } else if (sexoLower === 'hembra') {
          sexoNormalizado = 'Hembra';
        } else {
          sexoNormalizado = sexo;
        }
      }
      
      // Construir el objeto peso según tu modelo
      let pesoObj = null;
      if (peso && !isNaN(parseFloat(peso))) {
        pesoObj = {
          valor: parseFloat(peso),
          unidad: 'kg'
        };
      }
      
      // Crear la mascota con los campos correctos
      const nuevaMascota = new Paciente({
        // Campos requeridos
        nombre: citaTemporal.pacienteTemporal.nombre,
        especie: especieNormalizada,
        ownerId: cliente._id,
        // Campos opcionales
        raza: raza || '',
        edad: edad ? parseInt(edad) : null,
        sexo: sexoNormalizado,
        colorPelaje: colorPelaje || '',
        peso: pesoObj,
        temperatura: temperatura ? parseFloat(temperatura) : null,
        antecedentesMedicos: antecedentesMedicos || ''
      });
      
      const mascotaGuardada = await nuevaMascota.save();
      mascotaId = mascotaGuardada._id;
      console.log(`Mascota creada: ${mascotaGuardada.nombre} (ID: ${mascotaGuardada._id})`);
      console.log(`   - Especie: ${mascotaGuardada.especie}`);
      console.log(`   - Sexo: ${mascotaGuardada.sexo}`);
      
    } else {
      return res.status(400).json({ 
        message: 'No se encontró información de la mascota temporal',
        field: 'nombreMascota'
      });
    }
    
    // 2. ACTUALIZAR CITA REAL (Appointment)
    
    if (citaTemporal && citaTemporal.citaRealId) {
      const citaReal = await Cita.findById(citaTemporal.citaRealId);
      if (citaReal) {
        citaReal.pacienteId = mascotaId;
        citaReal.esCitaTemporal = false;
        await citaReal.save();
        console.log(`Cita actualizada: ${citaReal._id} con mascota: ${mascotaId}`);
      } else {
        console.log(`No se encontró la cita real con ID: ${citaTemporal.citaRealId}`);
      }
    }
    
    // 3. COMPLETAR CLIENTE (Owner)
    
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
    console.log(`Cliente completado: ${cliente.username}`);
    
    // 4. ENVIAR CORREO DE BIENVENIDA
    
    if (contrasenaAsignada && cliente.email) {
      try {
        await sendWelcomeEmail(cliente.email, cliente.username, DEFAULT_PASSWORD);
        console.log(`Correo de bienvenida enviado a: ${cliente.email}`);
      } catch (emailError) {
        console.error('Error enviando email:', emailError.message);
      }
    }
    
    // RESPUESTA
    
    res.json({ 
      message: contrasenaAsignada 
        ? 'Registro completado. Se ha enviado un correo con las credenciales de acceso.'
        : 'Registro completado exitosamente',
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
    console.error('Error en completarRegistroClienteTemporal:', error);
    
    // Manejar error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: mensajes[0],
        field: Object.keys(error.errors)[0]
      });
    }
    
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ message: errorResponse.message });
  }
};


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
    console.log(`Cliente temporal eliminado: ${cliente.username}`);
    
    res.json({ message: 'Cliente temporal eliminado exitosamente' });
    
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ message: errorResponse.message });
  }
};


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
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ message: errorResponse.message });
  }
};


export const getCitasTemporalesByCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Owner.findById(id).populate('citasTemporales.doctorId', 'username lastname especialidad');
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json(cliente.citasTemporales || []);
    
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ message: errorResponse.message });
  }
};