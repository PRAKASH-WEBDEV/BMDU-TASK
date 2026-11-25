const mongoose = require('mongoose');

let memoryServer = null;
let connecting = null; // cached promise so serverless invocations reuse one connection

async function openConnection() {
  let uri = process.env.MONGO_URI;

  if (process.env.USE_MEMORY_DB === 'true') {
    // Local-only fallback; lazy-required so production never loads it.
    const { MongoMemoryServer } = require('mongodb-memory-server-core');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('employee_management');
    console.log('Using in-memory MongoDB');
  }

  if (!uri) {
    throw new Error('MONGO_URI is not set. Copy .env.example to .env (or set it in Vercel) and configure it.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connecting) {
    connecting = openConnection().catch((err) => {
      connecting = null; // allow a retry on the next request
      throw err;
    });
  }
  return connecting;
}

async function disconnectDB() {
  await mongoose.disconnect();
  connecting = null;
  if (memoryServer) await memoryServer.stop();
}

module.exports = { connectDB, disconnectDB };
