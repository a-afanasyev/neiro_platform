import Handlebars from 'handlebars';
import { logger } from '../utils/logger';

/**
 * Template Service
 *
 * Compiles and renders email templates using Handlebars
 */

export interface TemplateData {
  [key: string]: any;
}

export class TemplateService {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.registerTemplates();
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers() {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    });

    // Time formatting helper
    Handlebars.registerHelper('formatTime', (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    });
  }

  /**
   * Register all email templates
   */
  private registerTemplates() {
    // Assignment Reminder Template
    this.templates.set(
      'assignment_reminder',
      Handlebars.compile(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Напоминание о задании</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Напоминание о задании</h1>
    </div>
    <div class="content">
      <p>Здравствуйте, {{parentName}}!</p>
      <p>Это напоминание о запланированном занятии с {{childName}}.</p>
      <h3>{{assignmentTitle}}</h3>
      <p><strong>Запланировано на:</strong> {{scheduledTime}}</p>
      <p>Пожалуйста, не забудьте выполнить задание и отправить отчет после завершения.</p>
      <a href="{{platformUrl}}/dashboard/assignments" class="button">Открыть задания</a>
    </div>
    <div class="footer">
      <p>Это автоматическое уведомление от платформы Neiro</p>
      <p>Если у вас есть вопросы, свяжитесь с вашим специалистом</p>
    </div>
  </div>
</body>
</html>
      `)
    );

    // Report Reviewed Template
    this.templates.set(
      'report_reviewed',
      Handlebars.compile(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Отчет проверен</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #22c55e; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
    .status-approved { background: #dcfce7; padding: 10px; border-left: 4px solid #22c55e; margin: 20px 0; }
    .status-attention { background: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #22c55e; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Отчет проверен специалистом</h1>
    </div>
    <div class="content">
      <p>Здравствуйте, {{parentName}}!</p>
      <p>Специалист {{specialistName}} проверил ваш отчет о занятии с {{childName}}.</p>

      <div class="status-{{reviewStatus}}">
        <h3>Статус: {{#if (eq reviewStatus 'approved')}}Одобрено ✓{{else}}Требует внимания⚠️{{/if}}</h3>
      </div>

      <h4>Комментарий специалиста:</h4>
      <p>{{reviewComment}}</p>

      {{#if nextSteps}}
      <h4>Следующие шаги:</h4>
      <p>{{nextSteps}}</p>
      {{/if}}

      <a href="{{platformUrl}}/dashboard/reports" class="button">Просмотреть отчет</a>
    </div>
    <div class="footer">
      <p>Это автоматическое уведомление от платформы Neiro</p>
      <p>Ответьте на это письмо, чтобы связаться со специалистом</p>
    </div>
  </div>
</body>
</html>
      `)
    );

    // New Assignment Template
    this.templates.set(
      'new_assignment',
      Handlebars.compile(`
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Новое задание</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #8b5cf6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
    .assignment-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e2e8f0; }
    .button { display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Новое задание назначено</h1>
    </div>
    <div class="content">
      <p>Здравствуйте, {{parentName}}!</p>
      <p>Специалист {{specialistName}} назначил новое задание для {{childName}}.</p>

      <div class="assignment-details">
        <h3>{{assignmentTitle}}</h3>
        <p><strong>Дата выполнения:</strong> {{formatDate dueDate}}</p>
        <p><strong>Описание:</strong> {{description}}</p>
        {{#if notes}}
        <p><strong>Заметки:</strong> {{notes}}</p>
        {{/if}}
      </div>

      <a href="{{platformUrl}}/dashboard/assignments" class="button">Открыть задание</a>
    </div>
    <div class="footer">
      <p>Это автоматическое уведомление от платформы Neiro</p>
    </div>
  </div>
</body>
</html>
      `)
    );

    logger.info('Email templates registered', { count: this.templates.size });
  }

  /**
   * Render template with data
   */
  render(templateName: string, data: TemplateData): string {
    const template = this.templates.get(templateName);

    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    // Add platform URL to all templates
    const renderData = {
      ...data,
      platformUrl: process.env.PLATFORM_URL || 'http://localhost:3001',
    };

    return template(renderData);
  }

  /**
   * Get all available template names
   */
  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}

// Singleton instance
export const templateService = new TemplateService();
