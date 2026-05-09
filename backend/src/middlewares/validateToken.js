import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import { promisify } from "util";
import User from "../models/user.model.js";

const verifyAsync = promisify(jwt.verify);

// ✅ Lista de rutas que NO requieren autenticación (patrones)
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
    
    const userFound = await User.findById(decodedUser.id).select('role username email');
    if (!userFound) {
      console.log("❌ Usuario no encontrado");
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
    
    const user = await User.findById(req.user.id).select('role');
    
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