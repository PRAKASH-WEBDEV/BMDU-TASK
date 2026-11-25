require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const { seedIfEmpty } = require('./seed');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    if (process.env.USE_MEMORY_DB === 'true') await seedIfEmpty();
    const server = app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

    const shutdown = async () => {
      server.close();
      await disconnectDB();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();
