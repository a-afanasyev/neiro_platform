// Test setup file
// This file runs before all tests

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_secret';
process.env.REPORTS_SERVICE_PORT = '4009';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.MINIO_ENDPOINT = 'localhost';
process.env.MINIO_PORT = '9000';
process.env.MINIO_ACCESS_KEY = 'test';
process.env.MINIO_SECRET_KEY = 'test';
process.env.MINIO_USE_SSL = 'false';

// Increase test timeout for integration tests
jest.setTimeout(10000);
