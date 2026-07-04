import User from "../models/user.model.js";
import Owner from "../models/owner.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { NODE_ENV, TOKEN_SECRET } from "../config.js";
import { sendResetPasswordEmail } from "../services/authService.js";
import { manejarError } from '../utils/errorHandler.js';
//ESTE ARCHIVO CONTIENE TODAS LAS FUNCIONES RELACIONADAS CON AUTENTICACIÓN Y USUARIOS

const isProduction = NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true, // SIEMPRE true(lo protege contra XSS)
  secure: isProduction, //solo se envian por https no http (Render usa HTTPS)
  sameSite: isProduction ? "none" : "lax", // permite enviar cookie a otros dominiod 
  path: "/",//disponible en toda la app
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// export const register = async (req, res) => {
//   const { email, password, username, lastname, phoneNumber } = req.body;
//   const errors = [];
//   if (!username) errors.push("Usuario es requerido");
//   if (!lastname) errors.push("Apellido es requerido");
//   if (!phoneNumber) errors.push("Número de teléfono es requerido");
//   if (!email) errors.push("Email es requerido");
//   if (!password) errors.push("Contraseña es requerida");

//   if (errors.length > 0) {
//     return res.status(400).json(errors);
//   }

//   try {
//     const userFound = await User.findOne({ email });
//     if(userFound)
//       return res.status(400).json(["the email is already in use"]);

//     const passwordHash = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       username,
//       email,
//       lastname,
//       phoneNumber,
//       password: passwordHash,
//     });
//     const userSaved = await newUser.save();
//     const token = await createAccessToken({ id: userSaved._id });

//     res.cookie("token", token, cookieOptions);

//     res.json({
//       _id: userSaved._id,
//       id: userSaved._id,
//       username: userSaved.username,
//       lastname: userSaved.lastname,
//       phoneNumber: userSaved.phoneNumber,
//       email: userSaved.email,
//       role: userSaved.role,
//       createdAt: userSaved.createdAt,
//       updatedAt: userSaved.updatedAt,
//       accessToken: token,  
//     });
//   } catch (error) {
//     const errorResponse = manejarError(error);
//     res.status(errorResponse.status).json({ 
//       message: errorResponse.message 
//     });
//   }
// };

export const login = async (req, res) => {
  console.log(" LOGIN INICIADO");
  console.log(" Body recibido:", req.body);

  const { email, password } = req.body;
  const errors = [];
  if (!email) errors.push("correo es requerido");
  if (!password) errors.push("contraseña es requerida");

  if (errors.length > 0) {
    console.log(" Errores de validación:", errors);
    return res.status(400).json(errors);
  }
  
  try {
    console.log(" Buscando en Owner primero...");
    let userFound = await Owner.findOne({ email });
    let esOwner = true;
    
    if (!userFound) {
      console.log(" No encontrado en Owner, buscando en User...");
      userFound = await User.findOne({ email });
      esOwner = false;
    }
    
    if (!userFound) {
      console.log(" Usuario no encontrado en ninguna colección");
      return res.status(400).json(["Credenciales inválidas"]);
    }
    
    console.log(" Usuario encontrado en:", esOwner ? "Owner" : "User");
    console.log(" Email:", userFound.email);
    console.log(" Rol:", esOwner ? 'client' : userFound.role);
    console.log(" Estado del usuario:", userFound.estado || 'No aplica');
    
    const isMatch = await bcrypt.compare(password, userFound.password);
    console.log(" ¿Contraseña válida?", isMatch);
    
    if (!isMatch) {
      console.log(" Contraseña incorrecta");
      return res.status(400).json(["Credenciales inválidas"]);
    }
    
    if (esOwner && userFound.estado !== 'completo') {
      console.log(" Cuenta incompleta. Estado:", userFound.estado);
      return res.status(400).json(["Cuenta pendiente de completar registro. Revisa tu correo para activar tu cuenta."]);
    }

    const token = await createAccessToken({ id: userFound._id });
    res.cookie("token", token, cookieOptions);
    
    console.log(" Login exitoso para:", userFound.email);

    res.json({
      _id: userFound._id,
      id: userFound._id,
      username: userFound.username,
      lastname: userFound.lastname || '',
      phoneNumber: userFound.phoneNumber || '',
      email: userFound.email,
      role: esOwner ? 'client' : userFound.role,
      ...(esOwner && { estado: userFound.estado, cedula: userFound.cedula }),
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
      accessToken: token,  
    });
    
  } catch (error) {
    console.error(" Error en login:", error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.json({ message: "logout" });
};

export const profile = async (req, res) => {
  try {
    let userFound = await User.findById(req.user.id);
    let esOwner = false;
    
    if (!userFound) {
      userFound = await Owner.findById(req.user.id);
      esOwner = true;
    }
    
    if (!userFound) return res.status(404).json(["User not found"]);

    return res.json({
      _id: userFound._id,
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      lastname: userFound.lastname || '',
      phoneNumber: userFound.phoneNumber || '',
      role: esOwner ? 'client' : userFound.role,
      ...(esOwner && { estado: userFound.estado, cedula: userFound.cedula, direccion: userFound.direccion }),
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const verifyToken = async (req, res) => {

  let token = req.cookies.token;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return res.status(401).json(["Unauthorized"]);

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);

    let userFound = await User.findById(decoded.id);
    let esOwner = false;
    
    if (!userFound) {
      userFound = await Owner.findById(decoded.id);
      esOwner = true;
    }
    
    if (!userFound) return res.status(401).json(["Unauthorized"]);
    
    return res.json({
      _id: userFound._id,
      id: userFound._id,
      username: userFound.username,
      lastname: userFound.lastname || '',
      phoneNumber: userFound.phoneNumber || '',
      email: userFound.email,
      role: esOwner ? 'client' : userFound.role,
      ...(esOwner && { estado: userFound.estado }),
    });
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

export const forgotPassword = async (req, res) => {

  console.log(" Forgot password request:", req.body.email);
  const { email } = req.body;

  if (!email) return res.status(400).json(["Email is required"]);

  try {
    let user = await User.findOne({ email });
    let esOwner = false;
    
    if (!user) {
      user = await Owner.findOne({ email });
      esOwner = true;
    }
  
    const response = await sendResetPasswordEmail(email);

    console.log(" Respuesta de sendResetPasswordEmail:", response);

    if (NODE_ENV === "development") {
      const devResponse = {
        success: true,
        message: response.message || "Se ha procesado el restablecimiento de la contraseña.",
      };
      if (response.debug && response.debug.resetLink) {
        devResponse.debug = {
          note: "Solo visible en desarrollo",
          resetLink: response.debug.resetLink,
          service: response.debug.service,
        };
        if (response.debug.previewUrl) {
          devResponse.debug.previewUrl = response.debug.previewUrl;
        }
      }
      return res.status(200).json(devResponse);
    } else {
      return res.status(200).json({
        success: true,
        message: "si existe una cuenta con este correo, recibirás instrucciones para restablecer tu contraseña.",
      });
    }
  } catch (error) {
    const errorResponse = manejarError(error);
    return res.status(200).json({
      success: true,
      message: "si existe una cuenta con este correo, recibirás instrucciones para restablecer tu contraseña",
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const errors = [];
  if (!token) errors.push("token es requerido");
  if (!password) errors.push("contraseña es requerida");
  if (errors.length > 0) {
    return res.status(400).json(errors);
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json(["contraseña debe tener al menos 6 caracteres"]);
  }
  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);

    let user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, 
    });
    
    if (!user) {
      user = await Owner.findOne({
        _id: decoded.id,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, 
      });
    }

    if (!user) {
      return res.status(400).json(["invalido o expirado token"]);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.password = passwordHash;
    user.resetPasswordToken = undefined; 
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json(["contraseña restablecida exitosamente"]);
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};


export const createRecepcion = async (req, res) => {
  try {
    const { username, lastname, email, phoneNumber } = req.body;
    
    console.log('📝 Creando recepcionista:', { username, email });
    
    // Validar campos obligatorios
    if (!username || !email) {
      return res.status(400).json({ 
        message: 'Nombre y email son obligatorios' 
      });
    }
    
    // Verificar si el email ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        message: 'El email ya está registrado' 
      });
    }
    
    // Contraseña predeterminada
    const DEFAULT_PASSWORD = 'VeteElExito2026';
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    
    // Crear usuario con rol recepcion
    const newUser = new User({
      username,
      lastname: lastname || '',
      email,
      phoneNumber: phoneNumber || '',
      password: hashedPassword,
      role: 'recepcion'
    });
    
    const savedUser = await newUser.save();
    console.log('✅ Recepcionista creado:', savedUser._id);
    
    // No enviar password en la respuesta
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      message: 'Recepcionista creado exitosamente. Contraseña: VeteElExito2026',
      user: userResponse
    });
    
  } catch (error) {
    console.error('❌ Error al crear recepcionista:', error);
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};