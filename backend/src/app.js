// backend/src/app.js - AGREGAR URLS DE EXPO
import 'dotenv/config'; 
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import tasksRoutes from './routes/tasks.routes.js'
import appointmentRoutes from './routes/appointment.routes.js'
import ownerRoutes from './routes/owner.routes.js'
import petRoutes from './routes/pet.routes.js'

// Permitir múltiples orígenes
const allowedOrigins = [
  "https://frontend-internal-platform.onrender.com",
  "http://localhost:8081",
  "http://localhost:19006",
  /\.exp\.direct$/,  // Para Expo tunnel
  /^exp:\/\//,       // Para Expo URLs
  "http://192.168.1.*:8081",  // Para LAN
];

const app = express();

app.set("trust proxy", 1)

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origen (mobile apps)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.some(pattern => {
        if (typeof pattern === 'string') return origin === pattern;
        if (pattern instanceof RegExp) return pattern.test(origin);
        return false;
      })) {
        callback(null, true);
      } else {
        console.log('CORS bloqueado para:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "X-Platform"
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use("/api", authRoutes);
app.use("/api", tasksRoutes);
app.use("/api", appointmentRoutes);
app.use("/api", ownerRoutes);
app.use("/api", petRoutes);

export default app;