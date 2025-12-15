// config.js - VERSIÓN FINAL
console.log('🔧 Cargando config.js...');

// 1. Variables locales primero (evita dependencias circulares)
const NODE_ENV_VALUE = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV_VALUE === 'production';

// 2. Debug importante
console.log('🔧 === CONFIGURACIÓN ===');
console.log('🔧 NODE_ENV:', NODE_ENV_VALUE);
console.log('🔧 Es producción?:', IS_PRODUCTION);
console.log('🔧 EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configurado' : '❌ Faltante');
console.log('🔧 EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configurado' : '❌ Faltante');
console.log('🔧 TOKEN_SECRET:', process.env.TOKEN_SECRET ? '✅ Configurado' : '❌ Faltante');
console.log('🔧 DB_URL:', process.env.DB_URL ? '✅ Configurado' : '❌ Faltante');

// 3. Configuración dinámica
const FRONTEND_URL_VALUE = IS_PRODUCTION
  ? 'https://frontend-internal-platform.onrender.com'
  : process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('🔧 FRONTEND_URL:', FRONTEND_URL_VALUE);
console.log('🔧 ====================');

// 4. Exportar
export const NODE_ENV = NODE_ENV_VALUE;
export const FRONTEND_URL = FRONTEND_URL_VALUE;
export const TOKEN_SECRET = process.env.TOKEN_SECRET;
export const DB_URL = process.env.DB_URL;
export const PORT = process.env.PORT || 3000;
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';
// ↑ IMPORTANTE: Elimina espacios de EMAIL_PASS automáticamente