require('dotenv').config();
const { app, server, io } = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3001;

// Socket.io connection handling
require('./sockets/socketHandlers')(io);

server.listen(PORT, async () => {
  console.log(`
🚀 CollabSpace API Server Started!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
🔗 WebSocket: Enabled
📋 Health Check: http://localhost:${PORT}/health
📚 API Root: http://localhost:${PORT}/
  `);
  
  // Test database connection (non-blocking - won't crash if it fails)
  await testConnection();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
