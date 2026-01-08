import 'dotenv/config'; 
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import tasksRoutes from './routes/tasks.routes.js'
import adminRoutes from './src/routes/admin.routes.js';     // ← ¡NUEVO!

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


app.use("/api", authRoutes);
app.use("/api", tasksRoutes);
app.use("/api/admin", adminRoutes); // ← ¡NUEVO! Todas las rutas admin empiezan con /api/admin


export default app;