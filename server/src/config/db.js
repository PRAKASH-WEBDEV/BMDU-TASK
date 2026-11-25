const mongoose = require('mongoose');

let memoryServer = null;

async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (process.env.USE_MEMORY_DB === 'true') {
    // Lazy-require so the package is only needed when this mode is used.
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('employee_management');
    console.log('Using in-memory MongoDB');
  }

  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy .env.example to .env and configure it.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDB, disconnectDB };
