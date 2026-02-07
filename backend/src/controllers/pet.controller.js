import Pet from '../models/pet.model.js';
import Owner from '../models/owner.model.js';

export const getPets = async (req, res) => {
  try {
    const { 
      search, 
      species, 
      ownerId, 
      status = 'active',
      page = 1, 
      limit = 20 
    } = req.query;
    
    const userId = req.user.id;
    
    const filter = { userId, status };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } },
        { chipNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (species) filter.species = species;
    if (ownerId) filter.owner = ownerId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const pets = await Pet.find(filter)
      .populate('owner', 'firstName lastName phone')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Pet.countDocuments(filter);
    
    res.json({
      success: true,
      pets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting pets:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener mascotas' 
    });
  }
};

export const getPet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const pet = await Pet.findOne({ _id: id, userId })
      .populate('owner', 'firstName lastName email phone address')
      .populate('userId', 'username email');
    
    if (!pet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mascota no encontrada' 
      });
    }
    
    res.json({
      success: true,
      pet
    });
  } catch (error) {
    console.error('Error getting pet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener mascota' 
    });
  }
};

export const createPet = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Verificar que el dueño existe y pertenece al usuario
    const owner = await Owner.findOne({ 
      _id: req.body.owner, 
      userId 
    });
    
    if (!owner) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dueño no encontrado' 
      });
    }
    
    // Verificar número de chip único si se proporciona
    if (req.body.chipNumber) {
      const existingPet = await Pet.findOne({ 
        chipNumber: req.body.chipNumber,
        userId 
      });
      
      if (existingPet) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ya existe una mascota con este número de chip' 
        });
      }
    }
    
    const petData = {
      ...req.body,
      userId,
      lastVisit: new Date()
    };
    
    const newPet = new Pet(petData);
    const savedPet = await newPet.save();
    
    // Poblar datos del dueño para la respuesta
    const populatedPet = await Pet.findById(savedPet._id)
      .populate('owner', 'firstName lastName phone');
    
    res.status(201).json({
      success: true,
      message: 'Mascota creada exitosamente',
      pet: populatedPet
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Número de chip ya registrado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear mascota' 
    });
  }
};

export const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que la mascota existe
    const pet = await Pet.findOne({ _id: id, userId });
    if (!pet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mascota no encontrada' 
      });
    }
    
    // Si se actualiza chip, verificar que no exista otro
    if (req.body.chipNumber && req.body.chipNumber !== pet.chipNumber) {
      const existingPet = await Pet.findOne({ 
        chipNumber: req.body.chipNumber,
        userId,
        _id: { $ne: id }
      });
      
      if (existingPet) {
        return res.status(400).json({ 
          success: false, 
          message: 'Ya existe otra mascota con este número de chip' 
        });
      }
    }
    
    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName phone');
    
    res.json({
      success: true,
      message: 'Mascota actualizada exitosamente',
      pet: updatedPet
    });
  } catch (error) {
    console.error('Error updating pet:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Número de chip ya registrado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error al actualizar mascota' 
    });
  }
};

export const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar que la mascota existe
    const pet = await Pet.findOne({ _id: id, userId });
    if (!pet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mascota no encontrada' 
      });
    }
    
    // Cambiar estado a archived en lugar de eliminar
    await Pet.findByIdAndUpdate(id, { 
      status: 'archived',
      archivedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Mascota archivada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar mascota' 
    });
  }
};

export const addVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { vaccination } = req.body;
    
    if (!vaccination || !vaccination.name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Datos de vacunación requeridos' 
      });
    }
    
    const pet = await Pet.findOne({ _id: id, userId });
    if (!pet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mascota no encontrada' 
      });
    }
    
    pet.vaccinations.push({
      ...vaccination,
      date: vaccination.date || new Date()
    });
    
    await pet.save();
    
    res.json({
      success: true,
      message: 'Vacunación agregada exitosamente',
      vaccinations: pet.vaccinations
    });
  } catch (error) {
    console.error('Error adding vaccination:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al agregar vacunación' 
    });
  }
};