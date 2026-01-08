import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import { promisify } from "util";
import User from "../models/user.model.js"; // ← AÑADE ESTA LÍNEA

const verifyAsync = promisify(jwt.verify);

export const validateToken = async (req, res, next) => {
  try {
    // 1. PRIMERO verificar cookie HTTP-Only
    let token = req.cookies.token;
    
    // 2. Si no hay cookie, verificar Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Extraer "Bearer token"
      }
    }
    
    if (!token) return res.status(401).json(["Unauthorized"]);

    const decodedUser = await verifyAsync(token, TOKEN_SECRET);
    
    // ✅ AÑADE ESTAS 4 LÍNEAS:
    const userFound = await User.findById(decodedUser.id).select('role username email');
    if (!userFound) return res.status(401).json(["Usuario no encontrado"]);
    req.user = userFound; // ← ESTO ES LO MÁS IMPORTANTE
    req.user.id = userFound._id;
    
    next();
  } catch (error) {
    return res.status(401).json(["Invalid token"]);
  }
};

// ✅ AÑADE ESTA FUNCIÓN COMPLETA AL FINAL:
export const adminRequired = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json(["No autorizado"]);
    }
    
    // Buscar usuario en BD para asegurar el role está actualizado
    const user = await User.findById(req.user.id).select('role');
    
    if (!user) {
      return res.status(401).json(["Usuario no encontrado"]);
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json(["Acceso denegado. Se requiere rol de administrador"]);
    }
    
    // Actualizar req.user con el role de la BD
    req.user.role = user.role;
    
    next();
  } catch (error) {
    console.error("❌ Error en adminRequired:", error);
    return res.status(500).json(["Error interno del servidor"]);
  }
};