import express from 'express';
import { validateToken, adminRequired } from '../middlewares/validateToken.js';
import { 
  getNewUsers,        
  getAdminStats      
} from '../controllers/auth.controller.js'; 
//ESTE ARCHIVO CONTIENE TODAS LAS RUTAS RELACIONADAS CON FUNCIONES DE ADMINISTRADOR


const router = express.Router();

// 📊 Estadísticas generales
router.get('/stats', validateToken, adminRequired, getAdminStats);

// 👥 Nuevos usuarios (últimos 7 días)
router.get('/new-users', validateToken, adminRequired, getNewUsers);

// 👤 Todos los usuarios 
router.get('/users', validateToken, adminRequired, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const query = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
   const users = await User.find(query)      // 1. Buscar usuarios
  .sort({ createdAt: -1 })                // 2. Ordenar por fecha (más nuevos primero)
  .skip((page - 1) * limit)               // 3. Saltar X usuarios (paginación)
  .limit(parseInt(limit))                 // 4. Limitar a Y usuarios por página
  .select('-password');                   // 5. Excluir password
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          totalItems: total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

export default router;