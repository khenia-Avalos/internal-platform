import 'dotenv/config';

// Línea 2 en adelante
import app from "./app.js";
import { PORT } from "./config.js";
import { connectDB } from "./db.js";

connectDB();
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});