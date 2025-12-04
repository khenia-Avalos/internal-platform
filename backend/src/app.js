import 'dotenv/config'; 
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'
import cors from 'cors'


import authRoutes from './routes/auth.routes.js'
import tasksRoutes from './routes/tasks.routes.js'

const app = express()

app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}))
app.use(morgan('dev'));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
app.use(cookieParser());

// ✅ Agrega esto para verificar que las variables se cargan
console.log('🔍 Verificando variables de entorno:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Cargado' : '❌ No cargado');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Cargado' : '❌ No cargado');



app.use("/api", authRoutes);
app.use("/api", tasksRoutes);

export default app;