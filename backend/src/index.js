import 'dotenv/config';
import app from "./app.js";
import { PORT } from "./config.js";
import { connectDB } from "./db.js";

// Importar rutas EXISTENTES
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/tasks.routes.js';

// Importar NUEVAS rutas
import ownerRoutes from './routes/owner.routes.js';
// import petRoutes from './routes/pet.routes.js'; // TEMPORAL: Comenta hasta crear
// import appointmentRoutes from './routes/appointment.routes.js'; // TEMPORAL: Comenta

// Conectar a la base de datos
connectDB();

// Registrar rutas
app.use('/api', authRoutes);
app.use('/api', taskRoutes);
app.use('/api', ownerRoutes);        // ✅ SOLO UNA VEZ
// app.use('/api', petRoutes);        // TEMPORAL: Comenta
// app.use('/api', appointmentRoutes); // TEMPORAL: Comenta

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📋 Rutas disponibles:`);
    console.log(`   - Auth: /api/login, /api/register, etc.`);
    console.log(`   - Tasks: /api/tasks`);
    console.log(`   - Owners: /api/owners`);
    console.log(`   - Pet: /api/pets (próximamente)`);
    console.log(`   - Appointments: /api/appointments (próximamente)`);
});