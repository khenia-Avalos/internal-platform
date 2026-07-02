import 'dotenv/config'; 
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import tasksRoutes from './routes/tasks.routes.js'
import doctorRoutes from './routes/doctor.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import pacientesRoutes from './routes/pacientes.routes.js';
import horarioRoutes from './routes/horario.routes.js';
import internadoRoutes from './routes/internado.routes.js';
import pausaRoutes from './routes/pausa.routes.js';
import citaRoutes from './routes/cita.routes.js';
import clientesTemporalesRoutes from './routes/clientesTemporales.routes.js';
import historialRoutes from './routes/historialClinico.routes.js';
import { FRONTEND_URL } from "./config.js";

const app = express();

app.set("trust proxy", 1)

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders:[
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders:["Set-Cookie"],
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// =============================================
// 🔥 RUTA DE PRUEBA - PARA VERIFICAR QUE EL BACKEND RESPONDE
// =============================================
app.get('/api/historial/test', (req, res) => {
  console.log('🔥🔥🔥 RUTA DE PRUEBA /api/historial/test FUNCIONA 🔥🔥🔥');
  res.json({ 
    success: true, 
    message: '¡LA RUTA DE HISTORIAL FUNCIONA!',
    timestamp: new Date().toISOString()
  });
});

// =============================================
// 🔥 RUTAS ESPECÍFICAS PRIMERO
// =============================================
console.log('📝 Registrando ruta /api/historial...');
app.use('/api/historial', historialRoutes);
console.log('✅ Ruta /api/historial registrada');

// =============================================
// RUTAS GENÉRICAS
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

console.log('✅ Todas las rutas registradas');

export default app;