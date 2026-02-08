// backend/src/controllers/owner.controller.js - AGREGAR LOGS
export const createOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('='.repeat(50));
    console.log('🚀 CREATE OWNER REQUEST RECIBIDA');
    console.log('📝 User ID:', userId);
    console.log('📦 Headers:', {
      authorization: req.headers.authorization ? 'Presente' : 'Ausente',
      'content-type': req.headers['content-type'],
    });
    console.log('📥 Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('='.repeat(50));
    
    // Validar datos requeridos
    const { firstName, lastName, email, phone } = req.body;
    
    if (!firstName || !lastName || !email || !phone) {
      console.log('❌ Faltan campos requeridos');
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
      console.log(`❌ Email ${email} ya existe para userId ${userId}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un cliente con este email' 
      });
    }
    
    const ownerData = {
      ...req.body,
      email: email.trim().toLowerCase(),
      userId,
      dni: req.body.dni || '',
      address: req.body.address || '',
      emergencyContact: req.body.emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      },
      notes: req.body.notes || ''
    };
    
    console.log('💾 Guardando en BD:', ownerData);
    
    const newOwner = new Owner(ownerData);
    const savedOwner = await newOwner.save();
    
    console.log('✅ Owner creado exitosamente:', savedOwner._id);
    console.log('='.repeat(50));
    
    res.status(201).json({
      success: true,
      message: 'Cliente creado exitosamente',
      owner: savedOwner
    });
  } catch (error) {
    console.error('='.repeat(50));
    console.error('🔥 ERROR EN CREATE OWNER:');
    console.error('❌ Error:', error.message);
    console.error('📌 Stack:', error.stack);
    console.error('📌 Error code:', error.code);
    console.error('📌 Error name:', error.name);
    console.error('='.repeat(50));
    
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