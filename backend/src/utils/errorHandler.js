/**
 * Traduce nombres de campos técnicos a nombres amigables
 */
const traducirNombreCampo = (campo) => {
  const nombres = {
    // Usuarios / Autenticación
    username: 'nombre de usuario',
    lastname: 'apellido',
    email: 'correo electrónico',
    phoneNumber: 'teléfono',
    password: 'contraseña',
    
    // Clientes (Owner)
    cedula: 'cédula',
    direccion: 'dirección',
    
    // Doctores
    especialidad: 'especialidad',
    
    // Mascotas (Paciente)
    nombre: 'nombre',
    especie: 'especie',
    raza: 'raza',
    edad: 'edad',
    sexo: 'sexo',
    colorPelaje: 'color de pelaje',
    peso: 'peso',
    temperatura: 'temperatura',
    antecedentesMedicos: 'antecedentes médicos',
    ownerId: 'dueño',
    
    // Citas
    doctorId: 'doctor',
    pacienteId: 'mascota',
    fecha: 'fecha',
    horaInicio: 'hora de inicio',
    horaFin: 'hora de fin',
    motivo: 'motivo',
    estado: 'estado',
    notas: 'notas',
    precio: 'precio',
    
    // Horarios
    dia: 'día',
    horaInicio: 'hora de inicio',
    horaFin: 'hora de fin',
    intervalo: 'intervalo entre citas',
    activo: 'estado',
    
    // Pausas
    inicio: 'inicio de pausa',
    fin: 'fin de pausa',
    activa: 'estado de pausa',
    
    // Internados
    fechaIngreso: 'fecha de ingreso',
    fechaEgreso: 'fecha de egreso',
    medicamentos: 'medicamentos',
    
    // General
    role: 'rol'
  };
  return nombres[campo] || campo;
};

/**
 * Traduce errores de tipo enum
 */
const traducirErrorEnum = (campo, valorRecibido) => {
  const opciones = {
    especie: ['perro', 'gato', 'ave', 'conejo', 'otro'],
    sexo: ['macho', 'hembra'],
    role: ['admin', 'doctor', 'client', 'owner'],
    especialidad: ['Medicina General', 'Groomer', 'Cirugía'],
    estado: ['pendiente', 'confirmada', 'cancelada', 'completada']
  };

  const opcionesTexto = opciones[campo]?.join(', ') || 'valores válidos';
  
  return `"${valorRecibido}" no es válido para ${traducirNombreCampo(campo)}. Opciones: ${opcionesTexto}`;
};

/**
 * Traduce errores de validación de Mongoose
 */
const traducirErrorValidacion = (error) => {
  const errores = [];

  for (let campo in error.errors) {
    const err = error.errors[campo];
    
    if (err.kind === 'enum') {
      errores.push(traducirErrorEnum(campo, err.value));
    }
    else if (err.kind === 'min') {
      if (campo === 'edad') {
        errores.push('La edad no puede ser negativa');
      } else if (campo === 'peso' || campo === 'intervalo') {
        errores.push(`El valor mínimo para ${traducirNombreCampo(campo)} es ${err.min}`);
      } else {
        errores.push(`El valor mínimo para ${traducirNombreCampo(campo)} es ${err.min}`);
      }
    }
    else if (err.kind === 'max') {
      errores.push(`El valor máximo para ${traducirNombreCampo(campo)} es ${err.max}`);
    }
    else if (err.kind === 'required') {
      errores.push(`El campo ${traducirNombreCampo(campo)} es obligatorio`);
    }
    else if (err.kind === 'unique') {
      errores.push(`El ${traducirNombreCampo(campo)} ya está registrado`);
    }
    else if (err.kind === 'regexp') {
      if (campo === 'phoneNumber') {
        errores.push('El formato del teléfono no es válido. Ejemplo: +50670983832');
      } else if (campo === 'horaInicio' || campo === 'horaFin') {
        errores.push(`El formato de ${traducirNombreCampo(campo)} no es válido. Ejemplo: 09:00`);
      } else {
        errores.push(`El formato de ${traducirNombreCampo(campo)} no es válido`);
      }
    }
    else if (err.kind === 'ObjectId') {
      errores.push(`ID no válido para ${traducirNombreCampo(campo)}`);
    }
    else {
      errores.push(err.message);
    }
  }

  return errores;
};

/**
 * Traduce errores de MongoDB (código 11000 - duplicado)
 */
const traducirErrorDuplicado = (error) => {
  const campo = Object.keys(error.keyPattern)[0];
  
  const mensajes = {
    email: 'Este correo electrónico ya está registrado',
    username: 'Este nombre de usuario ya está en uso',
    cedula: 'Esta cédula ya está registrada',
    phoneNumber: 'Este número de teléfono ya está registrado'
  };

  return mensajes[campo] || `El ${traducirNombreCampo(campo)} ya está en uso`;
};

/**
 * Manejador principal de errores
 */
export const manejarError = (error) => {
  console.error('🔴 Error detectado:', error);

  // Error de validación de Mongoose
  if (error.name === 'ValidationError') {
    const errores = traducirErrorValidacion(error);
    return {
      status: 400,
      message: errores.length === 1 ? errores[0] : errores
    };
  }

  // Error de duplicado (código 11000)
  if (error.code === 11000) {
    return {
      status: 400,
      message: traducirErrorDuplicado(error)
    };
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return {
      status: 401,
      message: 'Sesión inválida o expirada'
    };
  }

  // Error de cast (ID inválido)
  if (error.name === 'CastError') {
    return {
      status: 400,
      message: `ID no válido para ${traducirNombreCampo(error.path)}`
    };
  }

  // Errores personalizados que tú lanzas
  if (error.name === 'CustomError') {
    return {
      status: error.status || 400,
      message: error.message
    };
  }

  // Error de disponibilidad (horario, pausas, citas solapadas)
  if (error.message && error.message.includes('horario')) {
    return {
      status: 400,
      message: 'El doctor no tiene horario disponible en ese día'
    };
  }
  if (error.message && error.message.includes('pausa')) {
    return {
      status: 400,
      message: 'El doctor está en pausa en ese horario'
    };
  }
  if (error.message && error.message.includes('cita')) {
    return {
      status: 400,
      message: 'Ya existe una cita en ese horario'
    };
  }

  // Error por defecto
  console.error('❌ Error no manejado:', error);
  return {
    status: 500,
    message: 'Error interno del servidor'
  };
};