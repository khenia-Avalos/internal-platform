import Owner from '../models/owner.model.js';
import Pet from '../models/pet.model.js';

export const getOwners = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    
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
    
    const owners = await Owner.find(filter)
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username email');
    
    // Obtener conteo de mascotas por dueño
    const ownersWithPetCount = await Promise.all(
      owners.map(async (owner) => {
        const petCount = await Pet.countDocuments({ 
          owner: owner._id, 
          status: 'active' 
        });
        return {
          ...owner.toObject(),
          petCount
        };
      })
    );
    
    const total = await Owner.countDocuments(filter);
    
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
    console.error('Error getting owners:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener dueños' 
    });
  }
};

export const getOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const owner = await Owner.findOne({ _id: id, userId })
      .populate('userId', 'username email');
    
    if (!owner) {
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
    console.error('Error getting owner:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener dueño' 
    });
  }
};

export const createOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verificar si email ya existe
    const existingOwner = await Owner.findOne({ 
      email: req.body.email,
      userId 
    });
    
    if (existingOwner) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un dueño con este email' 
      });
    }
    
    const ownerData = {
      ...req.body,
      userId
    };
    
    const newOwner = new Owner(ownerData);
    const savedOwner = await newOwner.save();
    
    res.status(201).json({
      success: true,
      message: 'Dueño creado exitosamente',
      owner: savedOwner
    });
  } catch (error) {
    console.error('Error creating owner:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email o DNI ya registrado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear dueño' 
    });
  }
};

export const updateOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que el dueño existe y pertenece al usuario
    const owner = await Owner.findOne({ _id: id, userId });
    if (!owner) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dueño no encontrado' 
      });
    }
    
    // Si se actualiza email, verificar que no exista otro con ese email
    if (req.body.email && req.body.email !== owner.email) {
      const existingOwner = await Owner.findOne({ 
        email: req.body.email,
        userId,
        _id: { $ne: id }
      });
      
      if (existingOwner) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ya existe otro dueño con este email' 
        });
      }
    }
    
    const updatedOwner = await Owner.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Dueño actualizado exitosamente',
      owner: updatedOwner
    });
  } catch (error) {
    console.error('Error updating owner:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email o DNI ya registrado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar dueño' 
    });
  }
};

export const deleteOwner = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que el dueño existe
    const owner = await Owner.findOne({ _id: id, userId });
    if (!owner) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dueño no encontrado' 
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
        message: 'No se puede eliminar dueño con mascotas activas' 
      });
    }
    
    // Cambiar estado a archived en lugar de eliminar
    await Owner.findByIdAndUpdate(id, { status: 'archived' });
    
    res.json({
      success: true,
      message: 'Dueño archivado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting owner:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar dueño' 
    });
  }
};
