import 'dotenv/config'; 
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';
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
import { FRONTEND_URL } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Rutas API
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

// ✅ SERVIR EL FRONTEND (React) - Para manejar refrescos y rutas directas
if (process.env.NODE_ENV === 'production') {
  // Servir archivos estáticos del frontend
  const frontendPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(frontendPath));
  
  // Para cualquier ruta que no sea API, devolver index.html (SPA fallback)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

export default app;