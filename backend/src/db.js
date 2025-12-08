console.log('=== MONGODB CONNECTION INFO ===');
console.log('Current time:', new Date().toISOString());
console.log('Mongoose version:', mongoose.version);

// Esto puede mostrar info de conexión
mongoose.connect(DB_URL, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB Connected');
  console.log('Connection state:', mongoose.connection.readyState);
})
.catch(err => {
  console.error('❌ Connection error:', err.message);
});