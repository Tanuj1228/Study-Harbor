const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
// DB Connection
mongoose.connect(process.env.MONGO_URI) // Options removed
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Health Check Routes for Uptime Monitoring Bots (UptimeRobot, Render, etc.)
const getHealthStatus = (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const isHealthy = mongoose.connection.readyState === 1;
  const status = isHealthy ? 'healthy' : 'degraded';
  
  res.status(isHealthy ? 200 : 503).json({
    status,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: dbStateMap[mongoose.connection.readyState] || 'unknown'
  });
};

// Root & Health Endpoints
app.get('/', getHealthStatus);
app.get('/health', getHealthStatus);
app.get('/healthz', getHealthStatus);
app.get('/ping', getHealthStatus);
app.get('/api/ping', getHealthStatus);
app.get('/api/health', getHealthStatus);

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const publicRoutes = require('./src/routes/publicRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);
app.use('/api', feedbackRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));