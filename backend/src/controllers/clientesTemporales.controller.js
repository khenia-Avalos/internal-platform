import bcrypt from 'bcryptjs';
import Owner from '../models/owner.model.js';
import { sendWelcomeEmail } from '../services/authService.js';
import { manejarError } from '../utils/errorHandler.js'; // ✅ Importa el manejador

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
    
    // ✅ Validaciones manuales con mensajes específicos
    if (!username || username.trim() === '') {
      return res.status(400).json({ 
        message: 'El nombre del dueño es requerido',
        field: 'username'
      });
    }
    
    if (!email || email.trim() === '') {
      return res.status(400).json({ 
        message: 'El correo electrónico es requerido',
        field: 'email'
      });
    }
    
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Ingrese un correo electrónico válido (ejemplo: usuario@dominio.com)',
        field: 'email'
      });
    }
    
    if (!cedula || cedula.trim() === '') {
      return res.status(400).json({ 
        message: 'La cédula es requerida',
        field: 'cedula'
      });
    }
    
    if (!/^\d{6,12}$/.test(cedula)) {
      return res.status(400).json({ 
        message: 'La cédula debe contener solo números (6-12 dígitos)',
        field: 'cedula'
      });
    }
    
    if (!phoneNumber || phoneNumber.trim() === '') {
      return res.status(400).json({ 
        message: 'El número de teléfono es requerido',
        field: 'phoneNumber'
      });
    }
    
    const phoneRegex = /^\+\d{1,4}[0-9\s\-]{8,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ 
        message: 'El teléfono debe incluir código de país. Ejemplos: +50676486781 o +506 7098 3832',
        field: 'phoneNumber'
      });
    }
    
    if (!nombreMascota || nombreMascota.trim() === '') {
      return res.status(400).json({ 
        message: 'El nombre de la mascota es requerido',
        field: 'nombreMascota'
      });
    }
    
    if (!especie || especie.trim() === '') {
      return res.status(400).json({ 
        message: 'La especie de la mascota es requerida',
        field: 'especie'
      });
    }
    
    if (!doctorId) {
      return res.status(400).json({ 
        message: 'Debe seleccionar un veterinario',
        field: 'doctorId'
      });
    }
    
    if (!fechaCita) {
      return res.status(400).json({ 
        message: 'La fecha de la cita es requerida',
        field: 'fechaCita'
      });
    }
    
    if (!horaInicio || !horaFin) {
      return res.status(400).json({ 
        message: 'Debe seleccionar un horario disponible',
        field: 'horario'
      });
    }
    
    // ✅ Verificar email único
    const emailExistente = await Owner.findOne({ email });
    if (emailExistente) {
      return res.status(400).json({ 
        message: `El correo "${email}" ya está registrado. Use otro email.`,
        field: 'email'
      });
    }
    
    // ✅ Verificar cédula única
    const cedulaExistente = await Owner.findOne({ cedula });
    if (cedulaExistente) {
      return res.status(400).json({ 
        message: `La cédula "${cedula}" ya está registrada. Verifique sus datos.`,
        field: 'cedula'
      });
    }
    
    const nuevaCitaTemporal = {
      fecha: fechaCita,
      horaInicio,
      horaFin,
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
    
    const nuevoCliente = new Owner({
      username: username.trim(),
      lastname: lastname || '',
      phoneNumber: phoneNumber.trim(),
      email: email.toLowerCase().trim(),
      cedula: cedula.trim(),
      estado: 'temporal',
      citasTemporales: [nuevaCitaTemporal]
    });
    
    await nuevoCliente.save();
    
    console.log(`✅ Cliente creado: ${nuevoCliente.username}`);
    
    res.status(201).json({
      message: '✅ Cliente temporal y cita creados exitosamente',
      cliente: {
        _id: nuevoCliente._id,
        username: nuevoCliente.username,
        email: nuevoCliente.email,
        cedula: nuevoCliente.cedula,
        estado: nuevoCliente.estado
      }
    });
    
  } catch (error) {
    console.error('❌ Error en createClienteTemporal:', error);
    
    // ✅ Usar el manejador de errores para respuestas consistentes
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message
    });
  }
};