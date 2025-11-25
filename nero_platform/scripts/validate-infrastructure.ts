#!/usr/bin/env tsx
/**
 * Infrastructure Validation Script
 * Проверяет готовность MinIO, Redis, SMTP для Month 3 плана
 *
 * Usage:
 *   pnpm exec tsx scripts/validate-infrastructure.ts
 *
 * Exit codes:
 *   0 - Все сервисы доступны
 *   1 - Критические сервисы недоступны
 *   2 - Желательные сервисы недоступны
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as https from 'https';

const execAsync = promisify(exec);

interface ValidationResult {
  service: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  critical: boolean;
}

const results: ValidationResult[] = [];

// ============================================================
// 1. MinIO Validation
// ============================================================

async function validateMinIO(): Promise<ValidationResult> {
  console.log('\n🔍 Проверка MinIO...');

  try {
    // Check if container is running
    const { stdout: psOutput } = await execAsync('docker ps --filter name=neiro_minio --format "{{.Names}}"');
    if (!psOutput.includes('neiro_minio')) {
      return {
        service: 'MinIO',
        status: 'fail',
        message: 'Контейнер neiro_minio не запущен',
        critical: true
      };
    }

    // Check health endpoint
    const { stdout: healthOutput } = await execAsync(
      'docker exec neiro_minio curl -f http://localhost:9000/minio/health/live 2>/dev/null || echo "FAILED"'
    );

    if (healthOutput.includes('FAILED')) {
      return {
        service: 'MinIO',
        status: 'fail',
        message: 'Health check endpoint недоступен',
        critical: true
      };
    }

    // Check if buckets exist
    const { stdout: bucketsOutput } = await execAsync('docker exec neiro_minio mc ls minio/ 2>&1');

    const requiredBuckets = ['neiro-reports', 'neiro-reports-thumbnails'];
    const existingBuckets = bucketsOutput.split('\n').map(line => {
      const match = line.match(/\s+([a-z0-9-]+)\//);
      return match ? match[1] : null;
    }).filter(Boolean);

    const missingBuckets = requiredBuckets.filter(bucket => !existingBuckets.includes(bucket));

    if (missingBuckets.length > 0) {
      return {
        service: 'MinIO',
        status: 'warn',
        message: `Buckets не созданы: ${missingBuckets.join(', ')}. Выполните команды из MONTH_3_PLAN.md Task 0.1`,
        critical: false
      };
    }

    return {
      service: 'MinIO',
      status: 'pass',
      message: `Контейнер запущен, buckets созданы: ${requiredBuckets.join(', ')}`,
      critical: true
    };

  } catch (error: any) {
    return {
      service: 'MinIO',
      status: 'fail',
      message: `Ошибка проверки: ${error.message}`,
      critical: true
    };
  }
}

// ============================================================
// 2. Redis Validation
// ============================================================

async function validateRedis(): Promise<ValidationResult> {
  console.log('\n🔍 Проверка Redis...');

  try {
    // Check if container is running
    const { stdout: psOutput } = await execAsync('docker ps --filter name=neiro_redis --format "{{.Names}}"');
    if (!psOutput.includes('neiro_redis')) {
      return {
        service: 'Redis',
        status: 'fail',
        message: 'Контейнер neiro_redis не запущен',
        critical: true
      };
    }

    // Check PING command
    const { stdout: pingOutput } = await execAsync('docker exec neiro_redis redis-cli ping 2>&1');

    if (!pingOutput.includes('PONG')) {
      return {
        service: 'Redis',
        status: 'fail',
        message: 'Redis не отвечает на PING',
        critical: true
      };
    }

    // Check memory usage
    const { stdout: infoOutput } = await execAsync('docker exec neiro_redis redis-cli info memory 2>&1');
    const memoryMatch = infoOutput.match(/used_memory_human:(\S+)/);
    const memoryUsed = memoryMatch ? memoryMatch[1] : 'unknown';

    return {
      service: 'Redis',
      status: 'pass',
      message: `Redis запущен и отвечает. Память: ${memoryUsed}`,
      critical: true
    };

  } catch (error: any) {
    return {
      service: 'Redis',
      status: 'fail',
      message: `Ошибка проверки: ${error.message}`,
      critical: true
    };
  }
}

// ============================================================
// 3. PostgreSQL Validation
// ============================================================

async function validatePostgreSQL(): Promise<ValidationResult> {
  console.log('\n🔍 Проверка PostgreSQL...');

  try {
    // Check if container is running
    const { stdout: psOutput } = await execAsync('docker ps --filter name=neiro_postgres --format "{{.Names}}"');
    if (!psOutput.includes('neiro_postgres')) {
      return {
        service: 'PostgreSQL',
        status: 'fail',
        message: 'Контейнер neiro_postgres не запущен',
        critical: true
      };
    }

    // Check if database is ready
    const { stdout: readyOutput } = await execAsync(
      'docker exec neiro_postgres pg_isready -U neiro_user -d neiro_platform 2>&1'
    );

    if (!readyOutput.includes('accepting connections')) {
      return {
        service: 'PostgreSQL',
        status: 'fail',
        message: 'PostgreSQL не принимает соединения',
        critical: true
      };
    }

    // Check if event_outbox table exists
    const { stdout: tablesOutput } = await execAsync(
      'docker exec neiro_postgres psql -U neiro_user -d neiro_platform -c "\\dt event_outbox" 2>&1'
    );

    if (!tablesOutput.includes('event_outbox')) {
      return {
        service: 'PostgreSQL',
        status: 'warn',
        message: 'Таблица event_outbox не найдена. Выполните миграции.',
        critical: false
      };
    }

    return {
      service: 'PostgreSQL',
      status: 'pass',
      message: 'PostgreSQL запущен, event_outbox существует',
      critical: true
    };

  } catch (error: any) {
    return {
      service: 'PostgreSQL',
      status: 'fail',
      message: `Ошибка проверки: ${error.message}`,
      critical: true
    };
  }
}

// ============================================================
// 4. SMTP/SendGrid Validation
// ============================================================

async function validateSMTP(): Promise<ValidationResult> {
  console.log('\n🔍 Проверка SMTP/SendGrid...');

  try {
    // Check if SENDGRID_API_KEY is set
    const { stdout: envOutput } = await execAsync('echo $SENDGRID_API_KEY');

    if (!envOutput.trim() || envOutput.trim() === '') {
      // Try reading from .env file
      try {
        const { stdout: dotenvOutput } = await execAsync('grep SENDGRID_API_KEY .env 2>/dev/null || echo ""');

        if (!dotenvOutput.includes('SENDGRID_API_KEY=SG.')) {
          return {
            service: 'SMTP/SendGrid',
            status: 'warn',
            message: 'SENDGRID_API_KEY не настроен в .env. Уведомления не будут работать в Week 3.',
            critical: false
          };
        }
      } catch {
        return {
          service: 'SMTP/SendGrid',
          status: 'warn',
          message: 'SENDGRID_API_KEY не настроен. Настройте перед Week 3.',
          critical: false
        };
      }
    }

    return {
      service: 'SMTP/SendGrid',
      status: 'pass',
      message: 'SENDGRID_API_KEY настроен (валидация ключа требует тестовой отправки)',
      critical: false
    };

  } catch (error: any) {
    return {
      service: 'SMTP/SendGrid',
      status: 'warn',
      message: `Не удалось проверить: ${error.message}`,
      critical: false
    };
  }
}

// ============================================================
// 5. Prisma Schema Validation
// ============================================================

async function validatePrismaSchema(): Promise<ValidationResult> {
  console.log('\n🔍 Проверка Prisma Schema...');

  try {
    // Run prisma validate
    const { stdout, stderr } = await execAsync(
      'cd packages/database && pnpm exec prisma validate 2>&1'
    );

    if (stderr && stderr.includes('Error')) {
      return {
        service: 'Prisma Schema',
        status: 'fail',
        message: `Ошибки валидации: ${stderr.slice(0, 200)}`,
        critical: true
      };
    }

    // Check if critical models exist
    const { stdout: schemaContent } = await execAsync(
      'cat packages/database/prisma/schema.prisma'
    );

    const requiredModels = [
      'EventOutbox',
      'Notification',
      'Report',
      'MediaAsset',
      'Assignment'
    ];

    const missingModels = requiredModels.filter(model =>
      !schemaContent.includes(`model ${model}`)
    );

    if (missingModels.length > 0) {
      return {
        service: 'Prisma Schema',
        status: 'fail',
        message: `Отсутствуют модели: ${missingModels.join(', ')}`,
        critical: true
      };
    }

    return {
      service: 'Prisma Schema',
      status: 'pass',
      message: 'Schema валидна, все критические модели присутствуют',
      critical: true
    };

  } catch (error: any) {
    return {
      service: 'Prisma Schema',
      status: 'fail',
      message: `Ошибка валидации: ${error.message}`,
      critical: true
    };
  }
}

// ============================================================
// Main Execution
// ============================================================

async function main() {
  console.log('='.repeat(60));
  console.log('🚀 Neiro Platform - Infrastructure Validation');
  console.log('='.repeat(60));

  // Run all validations
  results.push(await validatePostgreSQL());
  results.push(await validateRedis());
  results.push(await validateMinIO());
  results.push(await validateSMTP());
  results.push(await validatePrismaSchema());

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 РЕЗУЛЬТАТЫ ПРОВЕРКИ');
  console.log('='.repeat(60));

  let criticalFailed = 0;
  let warningCount = 0;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    const criticalLabel = result.critical ? '[P0]' : '[P1]';

    console.log(`\n${icon} ${result.service} ${criticalLabel}`);
    console.log(`   ${result.message}`);

    if (result.status === 'fail' && result.critical) {
      criticalFailed++;
    } else if (result.status === 'warn' || (result.status === 'fail' && !result.critical)) {
      warningCount++;
    }
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 ИТОГОВЫЙ СТАТУС');
  console.log('='.repeat(60));

  const passCount = results.filter(r => r.status === 'pass').length;
  const totalCount = results.length;

  console.log(`\nПройдено: ${passCount}/${totalCount}`);
  console.log(`Критические ошибки: ${criticalFailed}`);
  console.log(`Предупреждения: ${warningCount}`);

  if (criticalFailed > 0) {
    console.log('\n❌ СТАТУС: КРИТИЧЕСКИЕ ОШИБКИ');
    console.log('   Week 1 не может начаться. Исправьте критические проблемы.');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('\n⚠️  СТАТУС: ПРЕДУПРЕЖДЕНИЯ');
    console.log('   Week 1 может начаться, но некоторые функции недоступны.');
    process.exit(2);
  } else {
    console.log('\n✅ СТАТУС: ВСЕ ГОТОВО');
    console.log('   Инфраструктура готова для Month 3.');
    process.exit(0);
  }
}

// Run validation
main().catch(error => {
  console.error('\n💥 Фатальная ошибка:', error.message);
  process.exit(1);
});
