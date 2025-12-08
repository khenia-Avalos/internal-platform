import os from 'os';
import https from 'https';

// Función para obtener IP pública
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

// Ejecutar al inicio
getPublicIP()
  .then(ip => {
    console.log('🎯 PUBLIC IP OF THIS RENDER INSTANCE:', ip);
    console.log('📌 Add this to MongoDB Atlas Network Access:', ip + '/32');
  })
  .catch(err => {
    console.error('❌ Cannot get public IP:', err.message);
    console.log('📌 Network interfaces:', os.networkInterfaces());
  });