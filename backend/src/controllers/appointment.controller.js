import Appointment from '../models/appointment.model.js';
import Pet from '../models/pet.model.js';
import Owner from '../models/owner.model.js';

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

export const createAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pet: petId, appointmentDate, startTime, endTime } = req.body;
    
    // Verificar que la mascota existe
    const pet = await Pet.findOne({ _id: petId, userId })
      .populate('owner');
    
    if (!pet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mascota no encontrada' 
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
    
    // Verificar disponibilidad de horario
    const appointmentDateTime = new Date(appointmentDate);
    const existingAppointment = await Appointment.findOne({
      userId,
      appointmentDate: appointmentDateTime,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
          status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
        }
      ]
    });
    
    if (existingAppointment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Conflicto de horario con otra cita',
        conflictingAppointment: {
          id: existingAppointment._id,
          startTime: existingAppointment.startTime,
          endTime: existingAppointment.endTime,
          pet: existingAppointment.pet
        }
      });
    }
    
    // Crear cita
    const appointmentData = {
      ...req.body,
      owner: pet.owner._id,
      veterinarian: req.body.veterinarian || userId,
      userId,
      appointmentDate: appointmentDateTime
    };
    
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
      .populate('veterinarian', 'username');
    
    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      appointment: populatedAppointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear cita' 
    });
  }
};

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
      
      const conflictingAppointment = await Appointment.findOne({
        userId,
        _id: { $ne: id },
        appointmentDate,
        $or: [
          {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
            status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
          }
        ]
      });
      
      if (conflictingAppointment) {
        return res.status(400).json({ 
          success: false, 
          message: 'Conflicto de horario con otra cita'
        });
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
    
    res.json({
      success: true,
      stats: {
        today: todayStats,
        month: monthStats,
        totals: {
          total: totalAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments
        }
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

// Helper function
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