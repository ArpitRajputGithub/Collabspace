const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const authController = {
  // Register new user with JWT
  register: async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body

      // Check if user already exists
      const existingUser = await User.findByEmail(email)
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        })
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

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          token
        }
      })

    } catch (error) {
      console.error('Register error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  },

  // Login user with JWT
  login: async (req, res) => {
    try {
      const { email, password } = req.body

      // Find user by email
      const user = await User.findByEmail(email)
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        })
      }

      // Verify password
      const isValidPassword = await user.verifyPassword(password)
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        })
      }

      // Update last login
      await user.updateLastLogin()

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      )

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token
        }
      })

    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  },

  // Refresh JWT token
  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token required'
        })
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        })
      }

      // Generate new access token
      const newToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      )

      res.json({
        success: true,
        data: {
          token: newToken
        }
      })

    } catch (error) {
      console.error('Refresh token error:', error)
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      })
    }
  },

  // Get user profile with JWT
  getProfile: async (req, res) => {
    try {
      // req.user is set by authenticateToken middleware
      const user = await User.findById(req.user.id)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        })
      }

      // Get user's workspaces
      let workspaces = []
      try {
        workspaces = await user.getWorkspaces()
      } catch (workspaceError) {
        console.error('Error fetching workspaces:', workspaceError)
      }

      res.json({
        success: true,
        data: {
          ...user.toJSON(),
          workspaces: workspaces || []
        }
      })

    } catch (error) {
      console.error('Get profile error:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}

module.exports = authController
