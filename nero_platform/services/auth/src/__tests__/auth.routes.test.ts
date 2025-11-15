import request from 'supertest'
import express from 'express'
import authRoutes from '../routes/auth.routes'

// Mock dependencies
jest.mock('@neiro/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

jest.mock('../services/jwt.service', () => ({
  generateAccessToken: jest.fn(() => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
  verifyToken: jest.fn(() => ({ valid: true, payload: { userId: 'test-user-id' } })),
}))

jest.mock('../services/redis.service', () => ({
  setSession: jest.fn(),
  getSession: jest.fn(),
  deleteSession: jest.fn(),
}))

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true)),
}))

describe('Auth Routes Integration Tests', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/auth/v1', authRoutes)
    
    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('POST /auth/v1/login', () => {
    it('should login successfully with valid credentials', async () => {
      const { prisma } = require('@neiro/database')
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'SPECIALIST',
        firstName: 'John',
        lastName: 'Doe',
        status: 'ACTIVE',
      })

      const response = await request(app)
        .post('/auth/v1/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('accessToken')
      expect(response.body.data).toHaveProperty('refreshToken')
      expect(response.body.data).toHaveProperty('user')
      expect(response.body.data.user.email).toBe('test@example.com')
    })

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/auth/v1/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    })

    it('should reject login with non-existent user', async () => {
      const { prisma } = require('@neiro/database')
      prisma.user.findUnique.mockResolvedValue(null)

      const response = await request(app)
        .post('/auth/v1/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('Invalid credentials')
    })

    it('should reject login with wrong password', async () => {
      const { prisma } = require('@neiro/database')
      const bcrypt = require('bcrypt')
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'SPECIALIST',
        status: 'ACTIVE',
      })
      
      bcrypt.compare.mockResolvedValue(false)

      const response = await request(app)
        .post('/auth/v1/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password',
        })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should reject login for suspended user', async () => {
      const { prisma } = require('@neiro/database')
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'SPECIALIST',
        status: 'SUSPENDED',
      })

      const response = await request(app)
        .post('/auth/v1/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(403)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('suspended')
    })
  })

  describe('POST /auth/v1/refresh', () => {
    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/auth/v1/refresh')
        .send({
          refreshToken: 'valid-refresh-token',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty('accessToken')
      expect(response.body.data).toHaveProperty('refreshToken')
    })

    it('should reject refresh with invalid token', async () => {
      const { verifyToken } = require('../services/jwt.service')
      verifyToken.mockReturnValue({ valid: false, error: 'Invalid token' })

      const response = await request(app)
        .post('/auth/v1/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should reject refresh without token', async () => {
      const response = await request(app)
        .post('/auth/v1/refresh')
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /auth/v1/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/v1/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.message).toContain('logged out')
    })

    it('should handle logout without token', async () => {
      const response = await request(app)
        .post('/auth/v1/logout')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /auth/v1/invite', () => {
    it('should create user invitation successfully (admin only)', async () => {
      const { prisma } = require('@neiro/database')
      
      prisma.user.findUnique.mockResolvedValue(null) // Email not taken
      prisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'newuser@example.com',
        role: 'SPECIALIST',
        firstName: 'Jane',
        lastName: 'Smith',
        status: 'PENDING',
      })

      const response = await request(app)
        .post('/auth/v1/invite')
        .set('Authorization', 'Bearer admin-token')
        .send({
          email: 'newuser@example.com',
          role: 'SPECIALIST',
          firstName: 'Jane',
          lastName: 'Smith',
        })
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe('newuser@example.com')
    })

    it('should reject invitation with existing email', async () => {
      const { prisma } = require('@neiro/database')
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com',
      })

      const response = await request(app)
        .post('/auth/v1/invite')
        .set('Authorization', 'Bearer admin-token')
        .send({
          email: 'existing@example.com',
          role: 'SPECIALIST',
          firstName: 'Jane',
          lastName: 'Smith',
        })
        .expect(409)

      expect(response.body.success).toBe(false)
      expect(response.body.error.message).toContain('already exists')
    })

    it('should reject invitation with invalid role', async () => {
      const response = await request(app)
        .post('/auth/v1/invite')
        .set('Authorization', 'Bearer admin-token')
        .send({
          email: 'newuser@example.com',
          role: 'INVALID_ROLE',
          firstName: 'Jane',
          lastName: 'Smith',
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })
})

