import { loginSchema, inviteUserSchema } from '../validators/auth.validators'

describe('Auth Validators', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
      }
      
      const result = loginSchema.safeParse(validData)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe(validData.email)
        expect(result.data.password).toBe(validData.password)
      }
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'SecurePassword123',
      }
      
      const result = loginSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      }
      
      const result = loginSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }
      
      const result = loginSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
    })

    it('should trim email whitespace', () => {
      const data = {
        email: '  test@example.com  ',
        password: 'SecurePassword123',
      }
      
      const result = loginSchema.safeParse(data)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('test@example.com')
      }
    })
  })

  describe('inviteUserSchema', () => {
    it('should validate correct invitation data', () => {
      const validData = {
        email: 'newuser@example.com',
        role: 'SPECIALIST',
        firstName: 'John',
        lastName: 'Doe',
      }
      
      const result = inviteUserSchema.safeParse(validData)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe(validData.email)
        expect(result.data.role).toBe(validData.role)
        expect(result.data.firstName).toBe(validData.firstName)
        expect(result.data.lastName).toBe(validData.lastName)
      }
    })

    it('should accept valid roles', () => {
      const validRoles = ['ADMIN', 'SPECIALIST', 'SUPERVISOR', 'PARENT']
      
      validRoles.forEach(role => {
        const data = {
          email: 'test@example.com',
          role,
          firstName: 'John',
          lastName: 'Doe',
        }
        
        const result = inviteUserSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid role', () => {
      const invalidData = {
        email: 'test@example.com',
        role: 'INVALID_ROLE',
        firstName: 'John',
        lastName: 'Doe',
      }
      
      const result = inviteUserSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
    })

    it('should require firstName and lastName', () => {
      const invalidData = {
        email: 'test@example.com',
        role: 'SPECIALIST',
      }
      
      const result = inviteUserSchema.safeParse(invalidData)
      
      expect(result.success).toBe(false)
    })

    it('should accept optional phone number', () => {
      const data = {
        email: 'test@example.com',
        role: 'SPECIALIST',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+79991234567',
      }
      
      const result = inviteUserSchema.safeParse(data)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.phone).toBe(data.phone)
      }
    })
  })
})

