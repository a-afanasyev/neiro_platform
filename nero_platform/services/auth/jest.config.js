/**
 * Jest конфигурация для Auth Service
 * 
 * Настройка тестирования с использованием ts-jest для TypeScript
 * Требования: coverage >80% для всех метрик
 */

module.exports = {
  // Использование ts-jest для компиляции TypeScript
  preset: 'ts-jest',
  
  // Окружение для тестов (Node.js)
  testEnvironment: 'node',
  
  // Корневая директория для поиска тестов
  roots: ['<rootDir>/src'],
  
  // Паттерны для поиска тестовых файлов
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.spec.ts'
  ],
  
  // Файлы для сбора coverage
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/index.ts'
  ],
  
  // Пороги coverage (>80% для production-ready кода)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Директория для отчетов coverage
  coverageDirectory: 'coverage',
  
  // Форматы отчетов
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Таймаут для тестов (10 секунд)
  testTimeout: 10000,
  
  // Очистка моков между тестами
  clearMocks: true,
  
  // Пути для модулей (для алиасов)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Настройка для ts-jest
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }
  }
};
