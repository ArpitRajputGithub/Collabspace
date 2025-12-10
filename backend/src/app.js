const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import existing routes
const authRouter = require('./routes/auth');
const workspaceRouter = require('./routes/workspaces');
const projectRouter = require('./routes/projects');
const taskRouter = require('./routes/tasks');
const activityRouter = require('./routes/activity');
const dashboardRouter = require('./routes/dashboard');
const messagesRouter = require('./routes/messages');

// Import existing middleware and handlers
const { authenticateToken } = require('./middleware/auth');
const { testConnection } = require('./config/database');
const socketHandlers = require('./sockets/socketHandlers'); 

// Load environment variables
require('dotenv').config();

// Initialize MongoDB connection (for messages)
const { connectMongoDB } = require('./config/mongodb');
connectMongoDB();

// Create Express application
const app = express();
const server = createServer(app);

// Socket.IO setup (your existing configuration)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

// Initialize socket handlers (your existing socket logic)
socketHandlers(io);

// Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security middleware
app.use(helmet());

// CORS middleware - allows frontend to communicate with backend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware - logs every HTTP request
app.use(morgan('combined'));

// Body parsing middleware - converts JSON to JavaScript objects
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Note: Database connection test is called from server.js to avoid duplicate calls

// Root endpoint - responds to GET requests
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to CollabSpace API! 🚀',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    auth: 'dual-system-ready'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    auth: 'jwt',
    database: 'connected',
    websockets: 'active'
  });
});

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 9000,
    auth: 'jwt',
    version: '1.0.0',
    database: 'postgresql',
    features: ['jwt-auth', 'websockets', 'real-time']
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/workspaces', workspaceRouter);
app.use('/api/projects', projectRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/activity', activityRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/projects', messagesRouter); // Messages routes under /api/projects/:projectId/messages

// Users endpoint (your existing endpoint)
app.get('/api/users', authenticateToken, (req, res) => {
  console.log('📋 Getting all users for authenticated user:', req.user.email);
  const users = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' }
  ];
  
  res.json({
    success: true,
    data: users,
    count: users.length,
    requestedBy: req.user.email
  });
});

// Ping-pong route (your existing endpoint)
app.get('/api/ping', (req, res) => {
  res.json({
    secretMessage: 'pong!',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime()} seconds`
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString(),
    suggestion: 'Check the API documentation for available endpoints'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global Error:', error);
  
  // Handle database errors
  if (error.code && error.code.startsWith('23')) {
    return res.status(400).json({
      error: 'Database constraint error',
      message: 'Data violates database constraints',
      timestamp: new Date().toISOString()
    });
  }
  
  // Generic error response
  res.status(error.status || 500).json({
    error: error.status >= 500 ? 'Internal server error' : 'Bad request',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

// Export both app and server for testing and external usage
module.exports = { app, server, io };
