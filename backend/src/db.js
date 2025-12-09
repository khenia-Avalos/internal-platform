import mongoose from "mongoose";
import { DB_URL } from "./config.js";
import https from 'https';
import os from 'os';

// Función para obtener IP pública de esta instancia de Render
const getPublicIP = () => {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.ip);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
};

export const connectDB = async () => {
  try {
    console.log('=== MONGODB CONNECTION DEBUG ===');
    console.log('1. Checking DB_URL:', DB_URL ? '✓ Set' : '✗ Not set');
    
    // Obtener IP pública de esta instancia
    console.log('2. Getting public IP of this Render instance...');
    try {
      const publicIP = await getPublicIP();
      console.log('   ✅ PUBLIC IP:', publicIP);
      console.log('   📝 Add this to MongoDB Atlas:', publicIP + '/32');
    } catch (ipError) {
      console.log('   ⚠️  Could not get public IP:', ipError.message);
      console.log('   📝 Network interfaces:', Object.keys(os.networkInterfaces()));
    }
    
    console.log('3. Connecting to MongoDB...');
    console.log('   Connection string starts with:', DB_URL ? DB_URL.substring(0, 50) + '...' : 'undefined');
    
    await mongoose.connect(DB_URL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('4. ✅ MongoDB Connected Successfully');
    console.log('   Connection state:', mongoose.connection.readyState);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database name:', mongoose.connection.name);
    console.log('   Mongoose version:', mongoose.version);
    
    // Intentar obtener más info de la conexión
    try {
      const adminDb = mongoose.connection.db.admin();
      const serverStatus = await adminDb.command({ connectionStatus: 1 });
      console.log('5. ✅ Connection authenticated');
      console.log('   User:', serverStatus.authInfo.authenticatedUsers[0]?.user);
    } catch (adminError) {
      console.log('5. ℹ️  Basic connection info only');
    }
    
    console.log('=== END DEBUG ===\n');
    
  } catch (error) {
    console.error('❌ MONGODB CONNECTION FAILED:');
    console.error('   Error message:', error.message);
    console.error('   Error name:', error.name);
    console.error('   Error code:', error.code);
    
    // Información específica para errores de red/IP
    if (error.name === 'MongoServerSelectionError') {
      console.error('   📌 This is likely an IP whitelist issue!');
      console.error('   📌 Check MongoDB Atlas Network Access');
    }
    
    process.exit(1);
  }
};