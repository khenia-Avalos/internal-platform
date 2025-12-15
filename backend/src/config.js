// config.js - VERSIÓN DEFINITIVA
console.log('🔧 Cargando config.js...');

const NODE_ENV_VALUE = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV_VALUE === 'production';

console.log('🔧 === CONFIGURACIÓN DEFINITIVA ===');
console.log('🔧 NODE_ENV:', NODE_ENV_VALUE);

// Configuración para SendGrid
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'sendgrid'; // 'gmail' o 'sendgrid'
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;

// Verificar configuración
if (IS_PRODUCTION) {
    console.log('🔧 Email Service:', EMAIL_SERVICE);
    console.log('🔧 EMAIL_HOST:', EMAIL_HOST || 'No configurado');
    console.log('🔧 EMAIL_USER:', EMAIL_USER || 'No configurado');
    console.log('🔧 EMAIL_PASS:', EMAIL_PASS ? '✅ Configurado' : '❌ Faltante');
}

export const NODE_ENV = NODE_ENV_VALUE;
export const FRONTEND_URL = IS_PRODUCTION
  ? 'https://frontend-internal-platform.onrender.com'
  : process.env.FRONTEND_URL || 'http://localhost:5173';
export const TOKEN_SECRET = process.env.TOKEN_SECRET;
export const DB_URL = process.env.DB_URL;
export const PORT = process.env.PORT || 3000;