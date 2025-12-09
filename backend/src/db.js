import mongoose from "mongoose";
import { DB_URL } from "./config.js";
import https from 'https';

// Función para obtener IP pública
const getPublicIP = () => {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).ip);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
};

export const connectDB = async () => {
  try {
    // LOG 1: Obtener IP pública ANTES de conectar
    try {
      const publicIP = await getPublicIP();
      console.log('🎯 RENDER INSTANCE PUBLIC IP:', publicIP);
      console.log('📌 Add to MongoDB Atlas:', publicIP + '/32');
    } catch (ipError) {
      console.log('⚠️ Could not get public IP:', ipError.message);
    }
    
    // LOG 2: Info de conexión
    console.log('🔗 Connecting to MongoDB...');
    console.log('   DB_URL starts with:', DB_URL ? DB_URL.substring(0, 40) + '...' : 'Not set!');
    
    // Conexión original
    await mongoose.connect(DB_URL);
    
    // LOG 3: Confirmación
    console.log('✅ DB is connected');
    console.log('   Host:', mongoose.connection.host);
    console.log('   Database:', mongoose.connection.name);
    
  } catch (error) {
    console.error('❌ DB connection error:', error.message);
    process.exit(1);
  }
};