import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken, verifyToken } from '../services/jwt.service'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key'
process.env.JWT_ACCESS_EXPIRY = '15m'
process.env.JWT_REFRESH_EXPIRY = '7d'

describe('JWT Service', () => {
  const testPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'USER',
  }

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = generateAccessToken(testPayload)
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
      expect(decoded.userId).toBe(testPayload.userId)
      expect(decoded.email).toBe(testPayload.email)
      expect(decoded.role).toBe(testPayload.role)
    })

    it('should include expiration time', () => {
      const token = generateAccessToken(testPayload)
      const decoded = jwt.decode(token) as any
      
      expect(decoded.exp).toBeTruthy()
      expect(decoded.iat).toBeTruthy()
      expect(decoded.exp).toBeGreaterThan(decoded.iat)
    })
  })

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = generateRefreshToken(testPayload)
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any
      expect(decoded.userId).toBe(testPayload.userId)
    })

    it('should have longer expiration than access token', () => {
      const accessToken = generateAccessToken(testPayload)
      const refreshToken = generateRefreshToken(testPayload)
      
      const accessDecoded = jwt.decode(accessToken) as any
      const refreshDecoded = jwt.decode(refreshToken) as any
      
      expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp)
    })
  })

  describe('verifyToken', () => {
    it('should verify valid access token', () => {
      const token = generateAccessToken(testPayload)
      const result = verifyToken(token, 'access')
      
      expect(result.valid).toBe(true)
      expect(result.payload?.userId).toBe(testPayload.userId)
      expect(result.payload?.email).toBe(testPayload.email)
    })

    it('should verify valid refresh token', () => {
      const token = generateRefreshToken(testPayload)
      const result = verifyToken(token, 'refresh')
      
      expect(result.valid).toBe(true)
      expect(result.payload?.userId).toBe(testPayload.userId)
    })

    it('should reject invalid token', () => {
      const result = verifyToken('invalid-token', 'access')
      
      expect(result.valid).toBe(false)
      expect(result.payload).toBeNull()
      expect(result.error).toBeTruthy()
    })

    it('should reject expired token', () => {
      // Create token that expires immediately
      const expiredToken = jwt.sign(
        { ...testPayload, exp: Math.floor(Date.now() / 1000) - 1 },
        process.env.JWT_SECRET!
      )
      
      const result = verifyToken(expiredToken, 'access')
      
      expect(result.valid).toBe(false)
      expect(result.error).toContain('expired')
    })

    it('should reject token with wrong secret', () => {
      const token = generateAccessToken(testPayload)
      const result = verifyToken(token, 'refresh') // Using refresh secret for access token
      
      expect(result.valid).toBe(false)
    })
  })
})

