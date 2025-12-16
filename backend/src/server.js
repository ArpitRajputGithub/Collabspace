require('dotenv').config();
const { app, server, io } = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3001;



server.listen(PORT, async () => {
  console.log(`
🚀 CollabSpace API Server Started!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
🔗 WebSocket: Enabled
📋 Health Check: http://localhost:${PORT}/health
📚 API Root: http://localhost:${PORT}/
  `);
  
  await testConnection();
});


