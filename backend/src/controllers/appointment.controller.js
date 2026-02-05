import Appointment from '../models/appointment.model.js';
import Client from '../models/client.model.js';

// Obtener todas las citas (con filtros)
export const getAppointments = async (req, res) => {
  try {
    const { date, status, type, clientId, page = 1, limit = 50 } = req.query;
    
    const filter = { createdBy: req.user.id };
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      filter.appointmentDate = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (clientId) filter.client = clientId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('client', 'petName ownerName ownerPhone')
      .populate('veterinarian', 'username email')
      .populate('createdBy', 'username email');
    
    const total = await Appointment.countDocuments(filter);
    
    res.json({
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener citas por rango de fechas (para calendario)
export const getAppointmentsByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {
      createdBy: req.user.id,
      appointmentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: 1, startTime: 1 })
      .populate('client', 'petName ownerName ownerPhone')
      .populate('veterinarian', 'username')
      .lean();
    
    // Transformar para calendario
    const calendarEvents = appointments.map(apt => ({
      id: apt._id,
      title: `${apt.client.petName} - ${apt.title}`,
      start: new Date(`${apt.appointmentDate.toISOString().split('T')[0]}T${apt.startTime}:00`),
      end: new Date(`${apt.appointmentDate.toISOString().split('T')[0]}T${apt.endTime}:00`),
      extendedProps: {
        client: apt.client,
        status: apt.status,
        type: apt.type,
        notes: apt.notes
      }
    }));
    
    res.json(calendarEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear nueva cita
export const createAppointment = async (req, res) => {
  try {
    // Verificar que el cliente existe
    const client = await Client.findById(req.body.client);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    // Verificar disponibilidad (opcional)
    const conflictingAppointment = await Appointment.findOne({
      appointmentDate: req.body.appointmentDate,
      startTime: { $lt: req.body.endTime },
      endTime: { $gt: req.body.startTime },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    if (conflictingAppointment) {
      return res.status(400).json({ 
        message: 'Conflicto de horario con otra cita',
        conflictingAppointment
      });
    }
    
    const appointmentData = {
      ...req.body,
      veterinarian: req.body.veterinarian || req.user.id,
      createdBy: req.user.id
    };
    
    const newAppointment = new Appointment(appointmentData);
    const savedAppointment = await newAppointment.save();
    
    const populatedAppointment = await Appointment.findById(savedAppointment._id)
      .populate('client', 'petName ownerName ownerPhone')
      .populate('veterinarian', 'username email');
    
    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar cita
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    
    // Verificar permiso
    if (appointment.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('client', 'petName ownerName ownerPhone')
    .populate('veterinarian', 'username email');
    
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar estado de cita
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    .populate('client', 'petName ownerName ownerPhone');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Estadísticas de citas
export const getAppointmentStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const stats = await Appointment.aggregate([
      {
        $match: {
          createdBy: req.user._id,
          appointmentDate: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const todayAppointments = await Appointment.countDocuments({
      createdBy: req.user.id,
      appointmentDate: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    res.json({
      statusDistribution: stats,
      todayAppointments,
      totalAppointments: await Appointment.countDocuments({ createdBy: req.user.id })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};