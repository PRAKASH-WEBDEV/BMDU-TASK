const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const employeeRoutes = require('./routes/employeeRoutes');
const { connectDB } = require('./config/db');
const { ApiError, notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Make sure MongoDB is connected before handling API calls. Locally server.js
// connects at startup; on Vercel (serverless) the first request connects.
app.use('/api', (req, res, next) => {
  connectDB()
    .then(() => next())
    .catch((err) => next(new ApiError(503, `Database unavailable: ${err.message}`)));
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use('/api/employees', employeeRoutes);

// Serve the built React app (client/dist) so UI and API share one URL,
// e.g. when exposing the app through ngrok. Run `npm run build` in client first.
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
