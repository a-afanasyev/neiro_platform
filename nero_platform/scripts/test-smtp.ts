#!/usr/bin/env ts-node
/**
 * Test SMTP Connection Script
 *
 * Проверяет подключение к SMTP серверу и отправку тестового письма
 *
 * Usage:
 *   npx ts-node scripts/test-smtp.ts
 *
 * Требования:
 *   - SMTP_USER, SMTP_PASS в .env
 *   - Gmail App Password (если используется Gmail)
 */

import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

dotenv.config();

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

async function testSMTPConnection() {
  console.log('🔧 Testing SMTP Configuration...\n');

  // Validate environment variables
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_EMAIL'];
  const missing = requiredVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    console.error('\nПожалуйста, добавьте их в .env файл:');
    console.error('SMTP_HOST=smtp.gmail.com');
    console.error('SMTP_PORT=587');
    console.error('SMTP_USER=your-email@gmail.com');
    console.error('SMTP_PASS=your-16-char-app-password');
    console.error('SMTP_FROM_EMAIL=noreply@neiro.dev');
    process.exit(1);
  }

  const config: SMTPConfig = {
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT!, 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  };

  console.log('Configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Secure: ${config.secure}`);
  console.log(`  User: ${config.auth.user}`);
  console.log(`  Pass: ${'*'.repeat(config.auth.pass.length)}\n`);

  // Create transporter
  const transporter = nodemailer.createTransport(config);

  try {
    // Step 1: Verify connection
    console.log('Step 1: Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    // Step 2: Send test email
    console.log('Step 2: Sending test email...');
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Neiro Platform'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: config.auth.user, // Send to yourself for testing
      subject: '✅ Neiro Platform - SMTP Test Email',
      text: `This is a test email from Neiro Platform.

Configuration:
- SMTP Host: ${config.host}
- SMTP Port: ${config.port}
- Timestamp: ${new Date().toISOString()}

If you received this email, your SMTP configuration is working correctly! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">✅ Neiro Platform - SMTP Test</h2>
          <p>This is a test email from <strong>Neiro Platform</strong>.</p>

          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Configuration:</h3>
            <ul>
              <li><strong>SMTP Host:</strong> ${config.host}</li>
              <li><strong>SMTP Port:</strong> ${config.port}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>

          <p style="color: #4CAF50; font-weight: bold;">
            If you received this email, your SMTP configuration is working correctly! 🎉
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #888; font-size: 12px;">
            This is an automated test email from Neiro Platform development environment.
          </p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Recipient: ${config.auth.user}\n`);

    console.log('🎉 SMTP configuration is working correctly!');
    console.log('\nNext steps:');
    console.log('  1. Check your inbox for the test email');
    console.log('  2. If not received, check spam folder');
    console.log('  3. You can now use this SMTP configuration in Week 3 Notifications Service\n');

    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ SMTP Test Failed!\n');

    if (error.code === 'EAUTH') {
      console.error('Authentication Error:');
      console.error('  - Check that SMTP_USER is correct');
      console.error('  - Check that SMTP_PASS is a valid App Password');
      console.error('  - For Gmail: Generate App Password at https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('Connection Error:');
      console.error('  - Check SMTP_HOST and SMTP_PORT');
      console.error('  - Check your internet connection');
      console.error('  - Check firewall settings');
    } else {
      console.error('Unknown Error:');
      console.error(error.message);
    }

    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run test
testSMTPConnection().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
