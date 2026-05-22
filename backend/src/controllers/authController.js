const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { sendSuccess, sendError } = require('../utils/apiResponse')

const authController = {
  // Register new user with JWT
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body

      // Check if user already exists
      const existingUser = await User.findByEmail(email)
      if (existingUser) {
        return sendError(res, 409, 'User with this email already exists')
      }

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password
      })

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      )

      return sendSuccess(res, {
          user: user.toJSON(),
          token
      }, {
        status: 201,
        message: 'User registered successfully'
      })

    } catch (error) {
      console.error('Register error:', error)
      return sendError(res, 500, 'Internal server error')
    }
  },

  // Login user with JWT
  login: async (req, res) => {
    try {
      const { email, password } = req.body

      // Find user by email
      const user = await User.findByEmail(email)
      if (!user) {
        return sendError(res, 401, 'Invalid email or password')
      }

      // Verify password
      const isValidPassword = await user.verifyPassword(password)
      if (!isValidPassword) {
        return sendError(res, 401, 'Invalid email or password')
      }

      // Update last login
      await user.updateLastLogin()

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      )

      return sendSuccess(res, {
          user: user.toJSON(),
          token
      }, {
        message: 'Login successful'
      })

    } catch (error) {
      console.error('Login error:', error)
      return sendError(res, 500, 'Internal server error')
    }
  },

  // Renew a JWT access token. This uses the existing token until a persisted
  // refresh-token model exists.
  refresh: async (req, res) => {
    try {
      const refreshToken = req.body.refreshToken || req.body.token
      
      if (!refreshToken) {
        return sendError(res, 401, 'Token required')
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)
      
      if (!user) {
        return sendError(res, 401, 'User not found')
      }

      // Generate new access token
      const newToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      )

      return sendSuccess(res, {
        token: newToken
      }, {
        message: 'Token renewed successfully'
      })

    } catch (error) {
      console.error('Refresh token error:', error)
      return sendError(res, 401, 'Invalid token')
    }
  },

  // Get user profile with JWT
  getProfile: async (req, res) => {
    try {
      // req.user is set by authenticateToken middleware
      const user = await User.findById(req.user.id)
      
      if (!user) {
        return sendError(res, 404, 'User not found')
      }

      // Get user's workspaces
      let workspaces = []
      try {
        workspaces = await user.getWorkspaces()
      } catch (workspaceError) {
        console.error('Error fetching workspaces:', workspaceError)
      }

      return sendSuccess(res, {
          ...user.toJSON(),
          workspaces: workspaces || []
      })

    } catch (error) {
      console.error('Get profile error:', error)
      return sendError(res, 500, 'Internal server error')
    }
  }
}

module.exports = authController
