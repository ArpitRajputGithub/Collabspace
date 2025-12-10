require('dotenv').config();
const { Pool } = require('pg');

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required database environment variables:', missingVars.join(', '));
  console.error('Please check your .env file and ensure all database variables are set.');
}

// Database connection pool configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Connection pool settings
  max: 20,          // Maximum number of connections
  idleTimeoutMillis: 30000,      
  connectionTimeoutMillis: 10000,   
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client:', err);
  process.exit(-1);
});

// Test database connection (non-blocking)
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('🗄️  Database connected successfully');
    console.log(`Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    const result = await client.query('SELECT NOW()');
    console.log('🕐 Database time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
