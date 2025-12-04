import 'dotenv/config';
import app from './app.js';
import { connectDB } from './db.js';

// Conectar a MongoDB
connectDB();

// Usar el puerto de Render (10000) o 3000 para desarrollo local
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});