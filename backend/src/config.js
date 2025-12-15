// config.js - VERSIÓN SIMPLE PARA GMAIL
console.log('🔧 Cargando config.js...');

const NODE_ENV_VALUE = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV_VALUE === 'production';

console.log('🔧 NODE_ENV:', NODE_ENV_VALUE);

// Configuración simple para Gmail
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';

// Verificar en producción
if (IS_PRODUCTION) {
    console.log('🔧 EMAIL_USER:', EMAIL_USER || '❌ NO CONFIGURADO');
    console.log('🔧 EMAIL_PASS:', EMAIL_PASS ? '✅ CONFIGURADO' : '❌ NO CONFIGURADO');
}

export const NODE_ENV = NODE_ENV_VALUE;
export const FRONTEND_URL = IS_PRODUCTION
  ? 'https://frontend-internal-platform.onrender.com'
  : process.env.FRONTEND_URL || 'http://localhost:5173';
export const TOKEN_SECRET = process.env.TOKEN_SECRET;
export const DB_URL = process.env.DB_URL;
export const PORT = process.env.PORT || 3000;