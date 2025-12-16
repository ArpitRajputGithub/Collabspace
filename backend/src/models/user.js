const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(userData) {
    this.id = userData.id;
    this.firstName = userData.first_name;
    this.lastName = userData.last_name;
    this.email = userData.email;
    this.passwordHash = userData.password_hash;
    this.avatarUrl = userData.avatar_url;
    this.emailVerified = userData.email_verified;
    this.isActive = userData.is_active;
    this.lastLoginAt = userData.last_login_at;
    this.createdAt = userData.created_at;
    this.updatedAt = userData.updated_at;

  }

  // Create new user (original JWT method)
  static async create({ firstName, lastName, email, password }) {
    const client = await pool.connect();
    try {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const query = `
        INSERT INTO users (first_name, last_name, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const values = [firstName, lastName, email.toLowerCase(), passwordHash];
      const result = await client.query(query, values);
      
      return new User(result.rows[0]);
    } finally {
      client.release();
    }
  }


  static async findByEmail(email) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM users 
        WHERE email = $1 AND is_active = true
      `;
      
      const result = await client.query(query, [email.toLowerCase()]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Find user by ID (original method)
  static async findById(id) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM users 
        WHERE id = $1 AND is_active = true
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new User(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Verify password (original method)
  async verifyPassword(password) {
    if (!this.passwordHash) {
      return false; // Clerk users don't have passwords
    }
    return await bcrypt.compare(password, this.passwordHash);
  }

  // Update last login (original method)
  async updateLastLogin() {
    const client = await pool.connect();
    try {
      const query = `
        UPDATE users 
        SET last_login_at = NOW() 
        WHERE id = $1
      `;
      
      await client.query(query, [this.id]);
      this.lastLoginAt = new Date();
    } finally {
      client.release();
    }
  }

  // Get user without password hash (original method)
  toJSON() {
    const { passwordHash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  // Get user's workspaces (original method)
  async getWorkspaces() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          w.*,
          wm.role,
          wm.joined_at
        FROM workspaces w
        JOIN workspace_members wm ON w.id = wm.workspace_id
        WHERE wm.user_id = $1 AND wm.is_active = true AND w.is_active = true
        ORDER BY w.created_at DESC
      `;
      
      const result = await client.query(query, [this.id]);
      return result.rows;
    } finally {
      client.release();
    }
  }
}

module.exports = User;
