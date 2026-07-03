import 'dotenv/config'; 
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import pacientesRoutes from './routes/pacientes.routes.js';
import horarioRoutes from './routes/horario.routes.js';
import internadoRoutes from './routes/internado.routes.js';
import pausaRoutes from './routes/pausa.routes.js';
import citaRoutes from './routes/cita.routes.js';
import clientesTemporalesRoutes from './routes/clientesTemporales.routes.js';
import historialRoutes from './routes/historialClinico.routes.js';
import documentoRoutes from './routes/documento.routes.js';
import { FRONTEND_URL } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// =============================================
// 🔥 SERVIR ARCHIVOS ESTÁTICOS DE UPLOADS
// =============================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================
// 🔥🔥🔥 RUTAS ESPECÍFICAS - PRIMERO DE TODAS
// =============================================
console.log('🔥 REGISTRANDO /api/historial PRIMERO');
app.use('/api/historial', historialRoutes);
app.use('/api/documentos', documentoRoutes);

// =============================================
// RUTAS DE PRUEBA PARA VERIFICAR
// =============================================
app.get('/api/test', (req, res) => {
  console.log('🔥 RUTA TEST FUNCIONA');
  res.json({ message: 'Backend OK' });
});

// =============================================
// EL RESTO DE RUTAS
// =============================================
app.use("/api", authRoutes);
app.use("/api", tasksRoutes);
app.use("/api", doctorRoutes);
app.use("/api", clientesRoutes);
app.use("/api", pacientesRoutes);
app.use("/api", horarioRoutes);
app.use("/api", internadoRoutes);
app.use("/api", pausaRoutes);
app.use("/api", citaRoutes);
app.use("/api", clientesTemporalesRoutes);

console.log('✅ TODAS LAS RUTAS REGISTRADAS');

export default app;