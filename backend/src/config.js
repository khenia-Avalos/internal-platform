// config.js - VERSIÓN CORRECTA (solo variables de entorno)
// NO pongas valores por defecto aquí
//por el momento sin validación de variables de entorno

export const TOKEN_SECRET = process.env.TOKEN_SECRET;
export const DB_URL = process.env.DB_URL;
// config.js - TEMPORAL para que funcione
export const FRONTEND_URL = NODE_ENV === 'production'
  ? 'https://frontend-internal-platform.onrender.com'  // Producción FIJA
  : process.env.FRONTEND_URL || 'http://localhost:5173'; // Desarrolloexport const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;

export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';