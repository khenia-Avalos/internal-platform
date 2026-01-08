import express from 'express';
import { validateToken, adminRequired } from '../middlewares/validateToken.js'; // ← 1. CAMBIA ESTA LÍNEA
import User from '../models/user.model.js';

const router = express.Router();

// ❌ 2. ELIMINA TODO ESTE BLOQUE (desde "const requireAdmin = ..." hasta "});"):
// const requireAdmin = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user || user.role !== 'admin') {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Acceso denegado. Se requiere rol de administrador.' 
//       });
//     }
//     next();
//   } catch (error) {
//     res.status(500).json({ 
//       success: false,
//       error: 'Error de servidor' 
//     });
//   }
// };

// 📊 Estadísticas generales
router.get('/stats', validateToken, adminRequired, async (req, res) => { // ← 3. CAMBIA requireAdmin por adminRequired
  try {
    const totalUsers = await User.countDocuments();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersLast7Days = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Estadísticas por rol
    const adminCount = await User.countDocuments({ role: 'admin' });
    const employeeCount = await User.countDocuments({ role: 'employee' });
    const clientCount = await User.countDocuments({ role: 'client' });
    
    res.json({
      success: true,
      data: {
        totalUsers,
        newUsersLast7Days,
        growthPercentage: totalUsers > 0 ? 
          ((newUsersLast7Days / totalUsers) * 100).toFixed(1) : 0,
        byRole: {
          admin: adminCount,
          employee: employeeCount,
          client: clientCount
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

// 👥 Nuevos usuarios (últimos 7 días)
router.get('/new-users', validateToken, adminRequired, async (req, res) => { // ← 3. CAMBIA requireAdmin por adminRequired
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const newUsers = await User.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .sort({ createdAt: -1 })
    .select('username lastname email phoneNumber createdAt role');
    
    res.json({
      success: true,
      data: newUsers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 👤 Todos los usuarios (con paginación)
router.get('/users', validateToken, adminRequired, async (req, res) => { // ← 3. CAMBIA requireAdmin por adminRequired
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const query = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');
    
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