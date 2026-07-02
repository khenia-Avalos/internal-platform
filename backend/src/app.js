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
// 🔥🔥🔥 RUTA DE EMERGENCIA - HISTORIAL CLÍNICO 🔥🔥🔥
// =============================================
app.get('/api/historial/cita/:citaId', async (req, res) => {
  console.log('🔥🔥🔥 RUTA DE EMERGENCIA - getHistorialByCita 🔥🔥🔥');
  console.log('📝 citaId:', req.params.citaId);
  
  try {
    // Importar el modelo dinámicamente
    const HistorialClinico = await import('./models/historialClinico.model.js').then(m => m.default);
    const historial = await HistorialClinico.findOne({ citaId: req.params.citaId });
    
    if (!historial) {
      console.log('❌ No hay registro clínico para esta cita');
      return res.status(404).json({ 
        success: false,
        message: 'No hay registro clínico para esta cita' 
      });
    }
    
    console.log('✅ Historial encontrado');
    res.json({ success: true, data: historial });
  } catch (error) {
    console.error('❌ Error en ruta de emergencia:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================
// 🔥 RUTA DE PRUEBA PARA VERIFICAR QUE EL BACKEND RESPONDE
// =============================================
app.get('/api/historial-test', (req, res) => {
  console.log('🔥 RUTA DE PRUEBA /api/historial-test FUNCIONA');
  res.json({ 
    success: true, 
    message: '¡BACKEND FUNCIONANDO!',
    timestamp: new Date().toISOString()
  });
});

// =============================================
// 🔥 RUTAS ESPECÍFICAS
// =============================================
console.log('📝 REGISTRANDO RUTA /api/historial...');
app.use('/api/historial', historialRoutes);
console.log('✅ RUTA /api/historial REGISTRADA');

// =============================================
// TODAS LAS DEMÁS RUTAS
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