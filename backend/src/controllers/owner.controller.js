import Owner from '../models/owner.model.js';
import Pet from '../models/pet.model.js';

export const getOwners = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    
    console.log('🔍 Buscando owners para userId:', userId);
    
    const filter = { userId };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { dni: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    console.log('📄 Filtro aplicado:', filter);
    
    const owners = await Owner.find(filter)
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Obtener conteo de mascotas por dueño
    const ownersWithPetCount = await Promise.all(
      owners.map(async (owner) => {
        const petCount = await Pet.countDocuments({ 
          owner: owner._id, 
          userId 
        });
        return {
          ...owner.toObject(),
          petCount
        };
      })
    );
    
    const total = await Owner.countDocuments(filter);
    
    console.log(`✅ Encontrados ${ownersWithPetCount.length} owners`);
    
    res.json({
      success: true,
      owners: ownersWithPetCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error getting owners:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener dueños',
      error: error.message 
    });
  }
};

export const getOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`🔍 Buscando owner ${id} para userId: ${userId}`);
    
    const owner = await Owner.findOne({ _id: id, userId });
    
    if (!owner) {
      console.log(`❌ Owner ${id} no encontrado`);
      return res.status(404).json({ 
        success: false, 
        message: 'Dueño no encontrado' 
      });
    }
    
    // Obtener mascotas de este dueño
    const pets = await Pet.find({ owner: id, userId })
      .select('name species breed gender birthDate weight status')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      owner: {
        ...owner.toObject(),
        pets
      }
    });
  } catch (error) {
    console.error('❌ Error getting owner:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener dueño',
      error: error.message
    });
  }
};

export const createOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📝 Creando owner para userId:', userId);
    console.log('📦 Datos recibidos:', req.body);
    
    // Validar datos requeridos
    const { firstName, lastName, email, phone } = req.body;
    
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, apellido, email y teléfono son requeridos' 
      });
    }
    
    // Verificar si email ya existe
    const existingOwner = await Owner.findOne({ 
      email: email.trim().toLowerCase(),
      userId 
    });
    
    if (existingOwner) {
      console.log(`❌ Email ${email} ya existe`);
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un cliente con este email' 
      });
    }
    
    const ownerData = {
      ...req.body,
      email: email.trim().toLowerCase(),
      userId,
      // Asegurar que campos opcionales tengan valores por defecto
      dni: req.body.dni || '',
      address: req.body.address || '',
      emergencyContact: req.body.emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      },
      notes: req.body.notes || ''
    };
    
    console.log('📦 Datos a guardar:', ownerData);
    
    const newOwner = new Owner(ownerData);
    const savedOwner = await newOwner.save();
    
    console.log('✅ Owner creado:', savedOwner._id);
    
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      owner: savedOwner
    });
  } catch (error) {
    console.error('❌ Error creating owner:', error);
    console.error('❌ Error details:', error.message);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ya registrado' 
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear cliente',
      error: error.message
    });
  }
};

export const updateOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`✏️ Actualizando owner ${id} para userId: ${userId}`);
    
    // Verificar que el dueño existe y pertenece al usuario
    const owner = await Owner.findOne({ _id: id, userId });
    if (!owner) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente no encontrado' 
      });
    }
    
    // Si se actualiza email, verificar que no exista otro con ese email
    if (req.body.email && req.body.email !== owner.email) {
      const existingOwner = await Owner.findOne({ 
        email: req.body.email.trim().toLowerCase(),
        userId,
        _id: { $ne: id }
      });
      
      if (existingOwner) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ya existe otro cliente con este email' 
        });
      }
    }
    
    const updatedOwner = await Owner.findByIdAndUpdate(
      id,
      {
        ...req.body,
        email: req.body.email ? req.body.email.trim().toLowerCase() : owner.email
      },
      { new: true, runValidators: true }
    );
    
    console.log('✅ Owner actualizado:', updatedOwner._id);
    
    res.json({
      success: true,
      message: 'Cliente actualizado exitosamente',
      owner: updatedOwner
    });
  } catch (error) {
    console.error('❌ Error updating owner:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ya registrado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar cliente',
      error: error.message
    });
  }
};

export const deleteOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log(`🗑️ Eliminando owner ${id} para userId: ${userId}`);
    
    // Verificar que el dueño existe
    const owner = await Owner.findOne({ _id: id, userId });
    if (!owner) {
      return res.status(404).json({ 
        success: false, 
        message: 'Cliente no encontrado' 
      });
    }
    
    // Verificar que no tenga mascotas activas
    const activePets = await Pet.countDocuments({ 
      owner: id, 
      userId,
      status: 'active'
    });
    
    if (activePets > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No se puede eliminar cliente con mascotas activas' 
      });
    }
    
    // Cambiar estado a archived en lugar de eliminar
    await Owner.findByIdAndUpdate(id, { 
      status: 'archived',
      archivedAt: new Date()
    });
    
    console.log('✅ Owner archivado:', id);
    
    res.json({
      success: true,
      message: 'Cliente archivado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error deleting owner:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar cliente',
      error: error.message
    });
  }
};