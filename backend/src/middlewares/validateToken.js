import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import { promisify } from "util";

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
    req.user = decodedUser;
    next();
  } catch (error) {
    return res.status(401).json(["Invalid token"]);
  }
};