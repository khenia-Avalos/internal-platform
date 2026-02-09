// backend/src/app.js
import 'dotenv/config'; 
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import tasksRoutes from './routes/tasks.routes.js'
import appointmentRoutes from './routes/appointment.routes.js' // NUEVO
import ownerRoutes from './routes/owner.routes.js' // NUEVO
import petRoutes from './routes/pet.routes.js' // NUEVO

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

// Rutas existentes
app.use("/api", authRoutes);
app.use("/api", tasksRoutes);

// Nuevas rutas para clínica
app.use("/api", appointmentRoutes); // NUEVO
app.use("/api", ownerRoutes); // NUEVO
app.use("/api", petRoutes); // NUEVO

export default app;