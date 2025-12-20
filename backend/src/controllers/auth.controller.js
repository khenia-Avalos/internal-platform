import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { NODE_ENV, TOKEN_SECRET } from "../config.js";
import { sendResetPasswordEmail } from "../services/authService.js";


const isProduction = NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true, // SIEMPRE true(lo protege contra XSS)
  secure: isProduction, //solo se envian por https no http (Render usa HTTPS)
  sameSite: isProduction ? "none" : "lax", // permite enviar cookie a otros dominiod 
  path: "/",//disponible en toda la app
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (req, res) => {
  const { email, password, username } = req.body;
  const errors = [];
  if (!username) errors.push("Username is required");
  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  if (errors.length > 0) {
    return res.status(400).json(errors);
  }

  try {
    const userFound = await User.findOne({ email });
    if(userFound)
      return res.status(400).json([" the email is already in use"]);

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({//objeto en memoria
      username,
      email,
      password: passwordHash,
    });
    const userSaved = await newUser.save();//guardar en bd 
    const token = await createAccessToken({ id: userSaved._id });

    res.cookie("token", token, cookieOptions);//para establecer el token como cookie en el navegador

   res.json({
  user: {
    id: userSaved._id,
    username: userSaved.username,
    email: userSaved.email,
    createdAt: userSaved.createdAt,
    updatedAt: userSaved.updatedAt,
  },
  accessToken: token,  
});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  console.log(req.body);

  const { email, password } = req.body;
  const errors = [];
  if (!email) errors.push("Email is required");
  if (!password) errors.push("Password is required");

  if (errors.length > 0) {
    return res.status(400).json(errors);
  }
  try {
    const userFound = await User.findOne({ email });

    if (!userFound) return res.status(400).json(["invalid email or password"]);

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(400).json(["invalid email or password"]);

    const token = await createAccessToken({ id: userFound._id });

    res.cookie("token", token, cookieOptions);

     res.json({
  user: {
    id: userSaved._id,
    username: userSaved.username,
    email: userSaved.email,
    createdAt: userSaved.createdAt,
    updatedAt: userSaved.updatedAt,
  },
  accessToken: token,  
});
  } catch (error) {
    res.status(500).json([error.message]);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.json({ message: "logout" });
};

export const profile = async (req, res) => {
  try {
    const userFound = await User.findById(req.user.id);
    if (!userFound) return res.status(404).json(["User not found"]);

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    res.status(500).json([error.message]);
  }
};

export const verifyToken = async (req, res) => {

  let token = req.cookies.token;//busca token en cookies

 
  if (!token && req.headers.authorization) {//si no esta en cookies busca en headers
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);//elimina "Bearer " para obtener el token
    }
  }

  if (!token) return res.status(401).json(["Unauthorized"]);

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);

    const userFound = await User.findById(decoded.id);//busca usuario por id decodificado
    if (!userFound) return res.status(401).json(["Unauthorized"]);
     return res.json({
      user: {
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
     
      }
     
    });
  } catch (error) {
    return res.status(403).json(["Invalid token"]);
  }
};

export const forgotPassword = async (req, res) => {
  console.log("📧 Forgot password request:", req.body.email);
  const { email } = req.body;

  if (!email) return res.status(400).json(["Email is required"]);

  try {
  
    const response = await sendResetPasswordEmail(email);

    console.log("📨 Respuesta de sendResetPasswordEmail:", response);

    if (NODE_ENV === "development") {
   
      const devResponse = {
        success: true,
        message: response.message || "Password reset processed",
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
        message:
          "If an account exists with this email, you will receive password reset instructions.",
      });
    }
  } catch (error) {
    console.error("❌ Error in forgot password:", error);

  
    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, you will receive password reset instructions.",
    });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;//token del email y nueva contraseña

  const errors = [];
  if (!token) errors.push("Token is required");
  if (!password) errors.push("Password is required");
  if (errors.length > 0) {
    return res.status(400).json(errors);
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json(["Password must be at least 6 characters long"]);
  }
  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);

    const user = await User.findOne({
      
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json(["Invalid or expired token"]);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.password = passwordHash;
    user.resetPasswordToken = undefined; 
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json(["Password reset successfully"]);
  } catch (error) {
    console.error("Error in reset password:", error);
    return res.status(500).json(["invalid or expired token"]);
  }
};
