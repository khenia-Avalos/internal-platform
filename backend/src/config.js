console.log('🔧 Cargando config.js...');

const NODE_ENV_VALUE = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV_VALUE === 'production';

console.log(' NODE_ENV:', NODE_ENV_VALUE);
console.log(' EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'gmail');

// Configuración unificada de email
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

// Para Gmail
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';

// Para SendGrid
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
export const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || '';

// Configuración general
export const NODE_ENV = NODE_ENV_VALUE;
export const FRONTEND_URL = IS_PRODUCTION
  ? 'https://internal-platform.onrender.com'
  : process.env.FRONTEND_URL || 'http://localhost:5173';
export const TOKEN_SECRET = process.env.TOKEN_SECRET;
export const DB_URL = process.env.DB_URL;
export const PORT = process.env.PORT || 3000;

// Verificar configuraciones
console.log(' Configuración cargada:');
console.log('   - FRONTEND_URL:', FRONTEND_URL);
console.log('   - EMAIL_SERVICE:', EMAIL_SERVICE);

if (EMAIL_SERVICE === 'sendgrid') {
    console.log('   - SENDGRID_API_KEY:', SENDGRID_API_KEY ? ' CONFIGURADO' : ' NO CONFIGURADO');
    console.log('   - SENDGRID_FROM_EMAIL:', SENDGRID_FROM_EMAIL || ' NO CONFIGURADO');
} else if (EMAIL_SERVICE === 'gmail') {
    console.log('   - EMAIL_USER:', EMAIL_USER || ' NO CONFIGURADO');
    console.log('   - EMAIL_PASS:', EMAIL_PASS ? ` CONFIGURADO (${EMAIL_PASS.length} chars)` : ' NO CONFIGURADO');
}


export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;