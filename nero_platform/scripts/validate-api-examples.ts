#!/usr/bin/env tsx
/**
 * API Contract Examples Validator
 *
 * Парсит JSON примеры из API_CONTRACTS_MVP.md и валидирует их против Zod schemas
 * Гарантирует, что документация синхронизирована с типами
 *
 * Usage: pnpm exec tsx scripts/validate-api-examples.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  CreateReportRequestSchema,
  SubmitReviewRequestSchema,
  type CreateReportRequest,
  type SubmitReviewRequest,
} from '../packages/types/reports';
import {
  UserNotificationSchema,
  NotificationPreferencesSchema,
  UpdateNotificationPreferencesRequestSchema,
} from '../packages/types/notifications';
import {
  ChildProgressResponseSchema,
  AssignmentsStatsResponseSchema,
  GoalsProgressResponseSchema,
} from '../packages/types/analytics';

interface ValidationResult {
  section: string;
  example: string;
  success: boolean;
  errors?: string[];
}

const results: ValidationResult[] = [];

function extractJSONExamples(markdown: string, sectionName: string): any[] {
  const examples: any[] = [];
  const codeBlockRegex = /```json\n([\s\S]*?)\n```/g;
  let match;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      examples.push(json);
    } catch (e) {
      console.warn(`⚠️  Failed to parse JSON in ${sectionName}:`, match[1].substring(0, 50));
    }
  }

  return examples;
}

function validateSection(
  markdown: string,
  sectionPattern: RegExp,
  sectionName: string,
  schema: any,
  exampleType: 'request' | 'response'
) {
  const sectionMatch = markdown.match(sectionPattern);
  if (!sectionMatch) {
    console.log(`⚠️  Section ${sectionName} not found`);
    return;
  }

  const examples = extractJSONExamples(sectionMatch[0], sectionName);
  console.log(`\n📄 Validating ${sectionName} (${examples.length} examples)`);

  examples.forEach((example, index) => {
    const result = schema.safeParse(example);

    if (result.success) {
      console.log(`  ✅ Example ${index + 1} valid`);
      results.push({
        section: sectionName,
        example: `Example ${index + 1}`,
        success: true,
      });
    } else {
      console.log(`  ❌ Example ${index + 1} invalid:`);
      result.error.issues.forEach((issue: any) => {
        console.log(`     - ${issue.path.join('.')}: ${issue.message}`);
      });
      results.push({
        section: sectionName,
        example: `Example ${index + 1}`,
        success: false,
        errors: result.error.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`),
      });
    }
  });
}

async function main() {
  console.log('🔍 API Contract Examples Validator\n');
  console.log('Reading API_CONTRACTS_MVP.md...\n');

  const apiContractsPath = path.join(__dirname, '../../Documents/API_CONTRACTS_MVP.md');
  const markdown = fs.readFileSync(apiContractsPath, 'utf-8');

  // Validate Reports API examples
  console.log('═══════════════════════════════════════════════════');
  console.log('📦 REPORTS SERVICE VALIDATION');
  console.log('═══════════════════════════════════════════════════');

  validateSection(
    markdown,
    /### POST `\/reports\/v1`[\s\S]*?(?=###|---)/,
    'POST /reports/v1 (Create Report)',
    CreateReportRequestSchema,
    'request'
  );

  validateSection(
    markdown,
    /### POST `\/reports\/v1\/:id\/review`[\s\S]*?(?=###|---)/,
    'POST /reports/v1/:id/review',
    SubmitReviewRequestSchema,
    'request'
  );

  // Validate User Notifications API examples
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🔔 USER NOTIFICATIONS VALIDATION');
  console.log('═══════════════════════════════════════════════════');

  validateSection(
    markdown,
    /#### GET `\/user-notifications\/v1`[\s\S]*?(?=####|###|---)/,
    'GET /user-notifications/v1',
    UserNotificationSchema.array(),
    'response'
  );

  // Validate Analytics API examples
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 ANALYTICS SERVICE VALIDATION');
  console.log('═══════════════════════════════════════════════════');

  validateSection(
    markdown,
    /#### GET `\/analytics\/v1\/children\/:childId\/progress`[\s\S]*?(?=####|###|---)/,
    'GET /analytics/v1/children/:childId/progress',
    ChildProgressResponseSchema,
    'response'
  );

  validateSection(
    markdown,
    /#### GET `\/analytics\/v1\/children\/:childId\/assignments-stats`[\s\S]*?(?=####|###|---)/,
    'GET /analytics/v1/children/:childId/assignments-stats',
    AssignmentsStatsResponseSchema,
    'response'
  );

  validateSection(
    markdown,
    /#### GET `\/analytics\/v1\/children\/:childId\/goals-progress`[\s\S]*?(?=####|###|---)/,
    'GET /analytics/v1/children/:childId/goals-progress',
    GoalsProgressResponseSchema,
    'response'
  );

  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📋 VALIDATION SUMMARY');
  console.log('═══════════════════════════════════════════════════\n');

  const total = results.length;
  const passed = results.filter((r) => r.success).length;
  const failed = total - passed;

  console.log(`Total examples validated: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ VALIDATION FAILED\n');
    console.log('Failed examples:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`\n  ${r.section} - ${r.example}`);
        r.errors?.forEach((e) => console.log(`    - ${e}`));
      });
    process.exit(1);
  } else {
    console.log('\n✅ ALL VALIDATIONS PASSED\n');
    console.log('API contracts are synchronized with TypeScript types.');
  }
}

main().catch((error) => {
  console.error('Error running validation:', error);
  process.exit(1);
});
