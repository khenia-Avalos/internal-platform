// backend/src/controllers/appointment.controller.js
import Appointment from '../models/appointment.model.js';
import Pet from '../models/pet.model.js';
import Owner from '../models/owner.model.js';
import User from '../models/user.model.js';

// Helper function para obtener horas disponibles
const getAvailableTimeSlots = (veterinarian, date, existingAppointments = []) => {
  const dayOfWeek = new Date(date).getDay();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = days[dayOfWeek];
  
  const availability = veterinarian.defaultAvailability[dayName];
  
  if (!availability.available) {
    return [];
  }
  
  const slots = [];
  const slotDuration = veterinarian.appointmentDuration || 30;
  const [startHour, startMinute] = availability.start.split(':').map(Number);
  const [endHour, endMinute] = availability.end.split(':').map(Number);
  
  let currentTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;
  
  while (currentTime + slotDuration <= endTime) {
    const slotStart = `${Math.floor(currentTime / 60).toString().padStart(2, '0')}:${(currentTime % 60).toString().padStart(2, '0')}`;
    const slotEnd = `${Math.floor((currentTime + slotDuration) / 60).toString().padStart(2, '0')}:${((currentTime + slotDuration) % 60).toString().padStart(2, '0')}`;
    
    // Verificar si el slot está ocupado
    const isOccupied = existingAppointments.some(apt => {
      const aptStart = parseInt(apt.startTime.split(':')[0]) * 60 + parseInt(apt.startTime.split(':')[1]);
      const aptEnd = parseInt(apt.endTime.split(':')[0]) * 60 + parseInt(apt.endTime.split(':')[1]);
      return (currentTime < aptEnd && (currentTime + slotDuration) > aptStart);
    });
    
    if (!isOccupied) {
      slots.push({
        start: slotStart,
        end: slotEnd,
        available: true
      });
    }
    
    currentTime += slotDuration;
  }
  
  return slots;
};

// Helper function para texto de estado
const getStatusText = (status) => {
  const statusMap = {
    'scheduled': 'programada',
    'confirmed': 'confirmada',
    'in-progress': 'en progreso',
    'completed': 'completada',
    'cancelled': 'cancelada',
    'no-show': 'no asistió'
  };
  return statusMap[status] || status;
};

// backend/src/controllers/appointment.controller.js
// REEMPLAZAR LA FUNCIÓN getAvailableVeterinarians con esta versión mejorada:

export const getAvailableVeterinarians = async (req, res) => {
  try {
    const { date, time } = req.query;
    const userId = req.user.id;
    
    console.log('='.repeat(60));
    console.log('👨‍⚕️ GET AVAILABLE VETERINARIANS REQUEST');
    console.log('👤 User ID:', userId);
    console.log('📅 Requested Date:', date);
    console.log('⏰ Requested Time:', time);
    
    // Obtener todos los veterinarios activos
    const veterinarians = await User.find({
      role: 'veterinarian',
      active: true
    }).select('-password');
    
    console.log('🔍 Veterinarios encontrados:', veterinarians.length);
    veterinarians.forEach(vet => {
      console.log(`   - ${vet.username} (ID: ${vet._id})`);
    });
    
    if (!veterinarians.length) {
      return res.json({
        success: true,
        veterinarians: [],
        message: 'No hay veterinarios registrados en el sistema'
      });
    }
    
    if (!date) {
      console.log('ℹ️ No se proporcionó fecha, retornando todos los veterinarios');
      return res.json({
        success: true,
        veterinarians: veterinarians.map(vet => ({
          ...vet.toObject(),
          available: true,
          message: 'Selecciona una fecha para ver disponibilidad'
        }))
      });
    }
    
    // Si hay fecha, verificar disponibilidad
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[dayOfWeek];
    
    console.log('📅 Día de la semana:', dayName);
    
    const veterinariansWithAvailability = await Promise.all(
      veterinarians.map(async (vet) => {
        console.log(`\n🔍 Procesando veterinario: ${vet.username}`);
        
        const availability = vet.defaultAvailability[dayName];
        console.log(`   📊 Disponibilidad configurada:`, availability);
        
        // Verificar si tiene excepciones para esta fecha
        const exception = vet.exceptions?.find(ex => 
          ex.date && ex.date.toDateString() === appointmentDate.toDateString()
        );
        
        console.log(`   ⚠️ Excepciones encontradas:`, exception);
        
        const isAvailableBySchedule = exception ? exception.available : availability.available;
        console.log(`   ✅ Disponible por horario: ${isAvailableBySchedule}`);
        
        if (!isAvailableBySchedule) {
          const reason = exception ? exception.reason : 'No disponible este día según horario';
          console.log(`   ❌ No disponible: ${reason}`);
          return {
            ...vet.toObject(),
            available: false,
            reason,
            availableSlots: []
          };
        }
        
        // Obtener citas existentes para este veterinario en esta fecha
        const existingAppointments = await Appointment.find({
          veterinarian: vet._id,
          appointmentDate: appointmentDate,
          status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
        });
        
        console.log(`   📅 Citas existentes: ${existingAppointments.length}`);
        
        // Si se especificó una hora, verificar disponibilidad en esa hora
        if (time) {
          const [hour, minute] = time.split(':').map(Number);
          const requestedTime = hour * 60 + minute;
          
          console.log(`   ⏰ Hora solicitada: ${time} (${requestedTime} minutos)`);
          
          // Verificar conflicto con citas existentes
          const hasConflict = existingAppointments.some(apt => {
            const aptStart = parseInt(apt.startTime.split(':')[0]) * 60 + parseInt(apt.startTime.split(':')[1]);
            const aptEnd = parseInt(apt.endTime.split(':')[0]) * 60 + parseInt(apt.endTime.split(':')[1]);
            const conflict = (requestedTime < aptEnd && (requestedTime + (vet.appointmentDuration || 30)) > aptStart);
            
            if (conflict) {
              console.log(`   ⚠️ Conflicto con cita: ${apt.startTime}-${apt.endTime}`);
            }
            
            return conflict;
          });
          
          const slots = getAvailableTimeSlots(vet, date, existingAppointments);
          console.log(`   🕒 Slots disponibles: ${slots.length}`);
          
          return {
            ...vet.toObject(),
            available: !hasConflict,
            availableSlots: slots
          };
        }
        
        // Obtener slots disponibles
        const availableSlots = getAvailableTimeSlots(vet, date, existingAppointments);
        console.log(`   🕒 Slots disponibles totales: ${availableSlots.length}`);
        
        return {
          ...vet.toObject(),
          available: availableSlots.length > 0,
          availableSlots,
          schedule: {
            start: availability.start,
            end: availability.end
          }
        };
      })
    );
    
    const availableVets = veterinariansWithAvailability.filter(vet => vet.available);
    console.log(`\n✅ Veterinarios disponibles: ${availableVets.length}/${veterinarians.length}`);
    
    res.json({
      success: true,
      veterinarians: veterinariansWithAvailability,
      summary: {
        total: veterinarians.length,
        available: availableVets.length,
        date: appointmentDate.toDateString(),
        dayName
      }
    });
  } catch (error) {
    console.error('❌ Error getting available veterinarians:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener veterinarios disponibles',
      error: error.message
    });
  }
};

// Obtener horarios disponibles para un veterinario
export const getVeterinarianAvailability = async (req, res) => {
  try {
    const { veterinarianId } = req.params;
    const { date } = req.query;
    const userId = req.user.id;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Fecha requerida'
      });
    }
    
    const veterinarian = await User.findOne({
      _id: veterinarianId,
      role: 'veterinarian',
      userId: userId
    });
    
    if (!veterinarian) {
      return res.status(404).json({
        success: false,
        message: 'Veterinario no encontrado'
      });
    }
    
    // Obtener citas existentes
   const existingAppointments = await Appointment.find({
  veterinarian: vet._id,
  appointmentDate: appointmentDate,
  status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
  userId: userId  // <- AGREGAR ESTA LÍNEA
});
    // Obtener slots disponibles
    const availableSlots = getAvailableTimeSlots(veterinarian, date, existingAppointments);
    
    res.json({
      success: true,
      veterinarian: {
        _id: veterinarian._id,
        username: veterinarian.username,
        specialty: veterinarian.specialty
      },
      date,
      availableSlots
    });
  } catch (error) {
    console.error('Error getting veterinarian availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener disponibilidad'
    });
  }
};

// Crear cita (actualizado para incluir verificación de disponibilidad)
export const createAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pet: petId, veterinarian: veterinarianId, appointmentDate, startTime, endTime } = req.body;
    
    console.log('='.repeat(60));
    console.log('📅 CREATE APPOINTMENT REQUEST');
    console.log('👤 User ID:', userId);
    console.log('🐕 Pet ID:', petId);
    console.log('👨‍⚕️ Veterinarian ID:', veterinarianId);
    console.log('📅 Date:', appointmentDate);
    console.log('⏰ Time:', startTime, '-', endTime);
    console.log('📥 Body:', JSON.stringify(req.body, null, 2));
    
    // Verificar que el veterinario existe y está activo
    const veterinarian = await User.findOne({
      _id: veterinarianId,
      role: 'veterinarian',
      active: true,
      userId: userId
    });
    
    if (!veterinarian) {
      console.log('❌ Veterinario no encontrado o inactivo:', veterinarianId);
      return res.status(404).json({
        success: false,
        message: 'Veterinario no disponible'
      });
    }
    
    // Verificar que la mascota existe
    const pet = await Pet.findOne({ _id: petId, userId })
      .populate('owner');
    
    if (!pet) {
      console.log('❌ Mascota no encontrada:', petId);
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }
    
    // Verificar disponibilidad del veterinario
    const { available, conflictingAppointment } = await Appointment.checkAvailability(
      veterinarianId,
      appointmentDate,
      startTime,
      endTime
    );
    
    if (!available) {
      console.log('❌ Conflicto de horario con cita:', conflictingAppointment?._id);
      return res.status(400).json({
        success: false,
        message: 'El veterinario no está disponible en este horario',
        conflictingAppointment: {
          id: conflictingAppointment._id,
          startTime: conflictingAppointment.startTime,
          endTime: conflictingAppointment.endTime,
          pet: conflictingAppointment.pet
        }
      });
    }
    
    // Verificar que el veterinario trabaja ese día y hora
    const appointmentDateTime = new Date(appointmentDate);
    const dayOfWeek = appointmentDateTime.getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[dayOfWeek];
    
    const availability = veterinarian.defaultAvailability[dayName];
    const [startHour, startMinute] = availability.start.split(':').map(Number);
    const [endHour, endMinute] = availability.end.split(':').map(Number);
    
    const slotStartTime = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const slotEndTime = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    const vetStartTime = startHour * 60 + startMinute;
    const vetEndTime = endHour * 60 + endMinute;
    
    if (!availability.available || slotStartTime < vetStartTime || slotEndTime > vetEndTime) {
      console.log('❌ Veterinario no disponible en este horario');
      return res.status(400).json({
        success: false,
        message: 'El veterinario no trabaja en este horario'
      });
    }
    
    // Verificar que el dueño existe
    const owner = await Owner.findOne({ 
      _id: pet.owner._id, 
      userId 
    });
    
    if (!owner) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dueño no encontrado' 
      });
    }
    
    // Crear cita
    const appointmentData = {
      ...req.body,
      owner: pet.owner._id,
      userId,
      appointmentDate: appointmentDateTime
    };
    
    console.log('💾 Guardando cita...');
    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();
    
    // Actualizar última visita de la mascota
    await Pet.findByIdAndUpdate(petId, {
      lastVisit: appointmentDateTime
    });
    
    // Poblar datos para respuesta
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('pet', 'name species breed')
      .populate('owner', 'firstName lastName phone')
      .populate('veterinarian', 'username email');
    
    console.log('✅ Cita creada:', savedAppointment._id);
    console.log('='.repeat(60));
    
    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cita'
    });
  }
};

// Obtener citas por veterinario
export const getVeterinarianAppointments = async (req, res) => {
  try {
    const { veterinarianId } = req.params;
    const { date } = req.query;
    const userId = req.user.id;
    
    const filter = {
      veterinarian: veterinarianId,
      userId
    };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.appointmentDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    const appointments = await Appointment.find(filter)
      .populate('pet', 'name species breed')
      .populate('owner', 'firstName lastName phone')
      .sort({ appointmentDate: 1, startTime: 1 });
    
    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    console.error('Error getting veterinarian appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener citas del veterinario'
    });
  }
};

// Obtener todas las citas
export const getAppointments = async (req, res) => {
  try {
    const { 
      date, 
      status, 
      type, 
      petId, 
      ownerId,
      startDate,
      endDate,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const userId = req.user.id;
    
    const filter = { userId };
    
    // Filtro por fecha específica
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.appointmentDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }
    
    // Filtro por rango de fechas
    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (petId) filter.pet = petId;
    if (ownerId) filter.owner = ownerId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const appointments = await Appointment.find(filter)
      .populate('pet', 'name species breed')
      .populate('owner', 'firstName lastName phone')
      .populate('veterinarian', 'username email')
      .sort({ appointmentDate: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Appointment.countDocuments(filter);
    
    res.json({
      success: true,
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener citas' 
    });
  }
};

// Obtener una cita específica
export const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const appointment = await Appointment.findOne({ _id: id, userId })
      .populate('pet', 'name species breed gender birthDate weight allergies specialConditions')
      .populate('owner', 'firstName lastName email phone address')
      .populate('veterinarian', 'username email');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cita no encontrada' 
      });
    }
    
    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener cita' 
    });
  }
};

// Actualizar una cita
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que la cita existe
    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cita no encontrada' 
      });
    }
    
    // Si se cambia la fecha/hora, verificar disponibilidad
    if ((req.body.appointmentDate || req.body.startTime || req.body.endTime)) {
      const appointmentDate = req.body.appointmentDate 
        ? new Date(req.body.appointmentDate) 
        : appointment.appointmentDate;
      
      const startTime = req.body.startTime || appointment.startTime;
      const endTime = req.body.endTime || appointment.endTime;
      
      // Verificar disponibilidad si cambia el veterinario
      const veterinarianId = req.body.veterinarian || appointment.veterinarian;
      
      if (veterinarianId) {
        const { available, conflictingAppointment } = await Appointment.checkAvailability(
          veterinarianId,
          appointmentDate,
          startTime,
          endTime,
          id // Excluir la cita actual
        );
        
        if (!available) {
          return res.status(400).json({ 
            success: false, 
            message: 'Conflicto de horario con otra cita',
            conflictingAppointment: {
              id: conflictingAppointment._id,
              startTime: conflictingAppointment.startTime,
              endTime: conflictingAppointment.endTime,
              pet: conflictingAppointment.pet
            }
          });
        }
      }
    }
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('pet', 'name species breed')
    .populate('owner', 'firstName lastName phone')
    .populate('veterinarian', 'username');
    
    res.json({
      success: true,
      message: 'Cita actualizada exitosamente',
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar cita' 
    });
  }
};

// Actualizar estado de una cita
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Estado requerido' 
      });
    }
    
    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cita no encontrada' 
      });
    }
    
    // Si se completa la cita, registrar check-out
    let updateData = { status };
    if (status === 'completed' && !appointment.checkOutTime) {
      updateData.checkOutTime = new Date();
    }
    
    // Si se marca como en progreso, registrar check-in
    if (status === 'in-progress' && !appointment.checkInTime) {
      updateData.checkInTime = new Date();
    }
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('pet', 'name species breed')
    .populate('owner', 'firstName lastName phone');
    
    res.json({
      success: true,
      message: `Cita ${getStatusText(status)}`,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar estado' 
    });
  }
};

// Eliminar una cita
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que la cita existe
    const appointment = await Appointment.findOne({ _id: id, userId });
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cita no encontrada' 
      });
    }
    
    // Solo permitir eliminar citas no completadas
    if (appointment.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede eliminar una cita completada' 
      });
    }
    
    await Appointment.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Cita eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar cita' 
    });
  }
};

// Obtener estadísticas de citas
export const getAppointmentsStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Estadísticas del día
    const todayStats = await Appointment.aggregate([
      {
        $match: {
          userId: userId,
          appointmentDate: {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999))
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Estadísticas del mes
    const monthStats = await Appointment.aggregate([
      {
        $match: {
          userId: userId,
          appointmentDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);
    
    // Próximas citas
    const upcomingAppointments = await Appointment.find({
      userId,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .populate('pet', 'name species')
    .populate('owner', 'firstName lastName')
    .populate('veterinarian', 'username')
    .sort({ appointmentDate: 1, startTime: 1 })
    .limit(5);
    
    // Conteo total
    const totalAppointments = await Appointment.countDocuments({ userId });
    const completedAppointments = await Appointment.countDocuments({ 
      userId, 
      status: 'completed' 
    });
    const cancelledAppointments = await Appointment.countDocuments({ 
      userId, 
      status: 'cancelled' 
    });
    
    // Veterinarios con más citas
    const topVeterinarians = await Appointment.aggregate([
      {
        $match: {
          userId: userId,
          appointmentDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: '$veterinarian',
          appointmentCount: { $sum: 1 }
        }
      },
      {
        $sort: { appointmentCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'veterinarianInfo'
        }
      },
      {
        $unwind: '$veterinarianInfo'
      },
      {
        $project: {
          _id: 1,
          username: '$veterinarianInfo.username',
          specialty: '$veterinarianInfo.specialty',
          appointmentCount: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        today: todayStats,
        month: monthStats,
        totals: {
          total: totalAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments
        },
        topVeterinarians
      },
      upcomingAppointments
    });
  } catch (error) {
    console.error('Error getting appointment stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas' 
    });
  }
};