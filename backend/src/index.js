// backend/src/index.js
import 'dotenv/config';
import app from "./app.js";
import { PORT } from "./config.js";
import { connectDB } from "./db.js";

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import ownerRoutes from './routes/owner.routes.js';
import petRoutes from './routes/pet.routes.js';

// Conectar a la base de datos
connectDB();

// Registrar rutas
app.use('/api', authRoutes);
app.use('/api', taskRoutes);
app.use('/api', ownerRoutes);
app.use('/api', petRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📋 Rutas disponibles:`);
    console.log(`   - Auth: /api/login, /api/register, etc.`);
    console.log(`   - Tasks: /api/tasks`);
    console.log(`   - Owners: /api/owners`);
    console.log(`   - Pets: /api/pets ✅`);
});