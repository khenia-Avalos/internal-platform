// src/middlewares/validateToken.js

import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import { promisify } from "util";
import User from "../models/user.model.js";
import Owner from "../models/owner.model.js"; 

const verifyAsync = promisify(jwt.verify);

// Lista de rutas que NO requieren autenticacion
const PUBLIC_PATHS = [
  '/api/public/doctores',
  '/api/public/horarios',
  '/api/clientes-temporales',
  '/api/confirmar-cita',
  '/api/cancelar-cita',
  '/api/historial'
];

export const validateToken = async (req, res, next) => {
  try {
    const isPublicPath = PUBLIC_PATHS.some(path => req.originalUrl.includes(path));
    
    if (isPublicPath) {
      console.log(`Ruta publica detectada: ${req.originalUrl} - Saltando autenticacion`);
      return next();
    }
    
    console.log(`Ruta protegida: ${req.originalUrl} - Verificando token`);
    
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "No autorizado" });
    }

    const decodedUser = await verifyAsync(token, TOKEN_SECRET);
    
    let userFound = await User.findById(decodedUser.id).select('role username email phoneNumber lastname');
    
    if (!userFound) {
      userFound = await Owner.findById(decodedUser.id).select('username email phoneNumber lastname estado');
      if (userFound) {
        userFound.role = 'client';
        console.log("Usuario encontrado en Owner (cliente):", userFound.username);
      }
    }
    
    if (!userFound) {
      console.log("Usuario no encontrado en ninguna coleccion. ID:", decodedUser.id);
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    
    req.user = userFound;
    req.user.id = userFound._id;
    
    console.log(`Usuario autenticado: ${userFound.username} (${userFound.role})`);
    next();
    
  } catch (error) {
    console.error("Error en validateToken:", error.message);
    return res.status(401).json({ message: "Token invalido" });
  }
};

// MIDDLEWARE EXISTENTE (solo admin)
export const adminRequired = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    let user = await User.findById(req.user.id).select('role');
    
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
    console.error("Error en adminRequired:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// NUEVO MIDDLEWARE: Permite admin, doctor y recepcion
export const doctorOrRecepcionOrAdminRequired = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    let user = await User.findById(req.user.id).select('role');
    
    if (!user) {
      const owner = await Owner.findById(req.user.id).select('role');
      if (owner) {
        user = { role: 'client' };
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    
    const allowedRoles = ['admin', 'doctor', 'recepcion'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        message: "Acceso denegado. Se requiere rol de administrador, doctor o recepcionista" 
      });
    }
    
    req.user.role = user.role;
    next();
  } catch (error) {
    console.error("Error en doctorOrRecepcionOrAdminRequired:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// NUEVO MIDDLEWARE: Permite ver documentos a clientes tambien
export const canViewDocuments = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    let user = await User.findById(req.user.id).select('role');
    
    if (!user) {
      const owner = await Owner.findById(req.user.id).select('role');
      if (owner) {
        user = { role: 'client' };
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }
    
    const allowedRoles = ['admin', 'doctor', 'recepcion', 'client'];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ 
        message: "Acceso denegado" 
      });
    }
    
    req.user.role = user.role;
    next();
  } catch (error) {
    console.error("Error en canViewDocuments:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};