import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import { promisify } from "util";
import User from "../models/user.model.js";
import Owner from "../models/owner.model.js"; // ← IMPORTAR Owner

const verifyAsync = promisify(jwt.verify);

// ✅ Lista de rutas que NO requieren autenticación
const PUBLIC_PATHS = [
  '/api/public/doctores',
  '/api/public/horarios',
  '/api/clientes-temporales',
  '/api/confirmar-cita',
  '/api/cancelar-cita',
];

export const validateToken = async (req, res, next) => {
  try {
    // ✅ VERIFICAR PRIMERO: Si la ruta es pública, saltar autenticación
    const isPublicPath = PUBLIC_PATHS.some(path => req.originalUrl.includes(path));
    
    if (isPublicPath) {
      console.log(`🔓 Ruta pública detectada: ${req.originalUrl} - Saltando autenticación`);
      return next();
    }
    
    console.log(`🔒 Ruta protegida: ${req.originalUrl} - Verificando token`);
    
    // 1. PRIMERO verificar cookie HTTP-Only
    let token = req.cookies.token;
    
    // 2. Si no hay cookie, verificar Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "No autorizado" });
    }

    const decodedUser = await verifyAsync(token, TOKEN_SECRET);
    
    // ✅ PRIMERO buscar en User (doctores, admins)
    let userFound = await User.findById(decodedUser.id).select('role username email phoneNumber lastname');
    
    // ✅ SI NO ESTÁ EN User, BUSCAR EN Owner (clientes)
    if (!userFound) {
      userFound = await Owner.findById(decodedUser.id).select('username email phoneNumber lastname estado');
      if (userFound) {
        // Los owners son clientes
        userFound.role = 'client';
        console.log("✅ Usuario encontrado en Owner (cliente):", userFound.username);
      }
    }
    
    if (!userFound) {
      console.log("❌ Usuario no encontrado en ninguna colección. ID:", decodedUser.id);
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    
    req.user = userFound;
    req.user.id = userFound._id;
    
    console.log(`✅ Usuario autenticado: ${userFound.username} (${userFound.role})`);
    next();
    
  } catch (error) {
    console.error("❌ Error en validateToken:", error.message);
    return res.status(401).json({ message: "Token inválido" });
  }
};

export const adminRequired = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    // Buscar en User primero
    let user = await User.findById(req.user.id).select('role');
    
    // Si no está en User, buscar en Owner
    if (!user) {
      const owner = await Owner.findById(req.user.id).select('role');
      if (owner) {
        user = { role: 'client' };
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador" });
    }
    
    req.user.role = user.role;
    
    next();
  } catch (error) {
    console.error("❌ Error en adminRequired:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};