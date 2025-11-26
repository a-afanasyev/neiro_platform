import puppeteer, { Browser, Page } from 'puppeteer';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { logger } from '../utils/logger';

/**
 * PDF Generation Service
 *
 * Generates PDF reports using Puppeteer:
 * - Child progress reports for parents
 * - Analytics reports for specialists
 * - Summary reports for supervisors/admin
 */

interface ChildReportData {
  childId: string;
  childName: string;
  parentName: string;
  period: { from: string; to: string };
  stats: {
    totalAssignments: number;
    completedAssignments: number;
    completionRate: number;
    totalReports: number;
    averageDuration: number;
    moodDistribution: { good: number; neutral: number; difficult: number };
    progressTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  };
  recentActivity: Array<{
    date: string;
    assignmentsCompleted: number;
    reportsSubmitted: number;
  }>;
}

interface SpecialistReportData {
  specialistId: string;
  specialistName: string;
  period: { from: string; to: string };
  stats: {
    totalChildren: number;
    totalAssignments: number;
    totalReports: number;
    averageReviewTime: number;
    approvalRate: number;
  };
  childrenProgress: Array<{
    childId: string;
    childName: string;
    completionRate: number;
    lastActivity: string | null;
  }>;
}

export class PDFService {
  private browser: Browser | null = null;

  /**
   * Initialize browser instance
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  /**
   * Close browser instance
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Generate Child Progress Report PDF
   */
  async generateChildReport(data: ChildReportData): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const html = this.generateChildReportHTML(data);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
      });

      return Buffer.from(pdf);
    } catch (error) {
      logger.error('Error generating child report PDF', { error, childId: data.childId });
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Generate Specialist Analytics Report PDF
   */
  async generateSpecialistReport(data: SpecialistReportData): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      const html = this.generateSpecialistReportHTML(data);
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        printBackground: true,
      });

      return Buffer.from(pdf);
    } catch (error) {
      logger.error('Error generating specialist report PDF', { error, specialistId: data.specialistId });
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Generate HTML for Child Progress Report
   */
  private generateChildReportHTML(data: ChildReportData): string {
    const fromDate = format(new Date(data.period.from), 'd MMMM yyyy', { locale: ru });
    const toDate = format(new Date(data.period.to), 'd MMMM yyyy', { locale: ru });
    const generatedAt = format(new Date(), 'd MMMM yyyy, HH:mm', { locale: ru });

    const progressTrendLabel = {
      improving: 'Улучшение',
      stable: 'Стабильно',
      declining: 'Требует внимания',
      insufficient_data: 'Недостаточно данных',
    }[data.stats.progressTrend];

    const progressTrendColor = {
      improving: '#22c55e',
      stable: '#3b82f6',
      declining: '#ef4444',
      insufficient_data: '#94a3b8',
    }[data.stats.progressTrend];

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Отчет о прогрессе - ${data.childName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1e293b;
      background: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    .header h1 {
      color: #1e40af;
      font-size: 24pt;
      margin-bottom: 10px;
    }
    .header .period {
      color: #64748b;
      font-size: 11pt;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 16pt;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e2e8f0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      background: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .info-label {
      font-size: 10pt;
      color: #64748b;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 14pt;
      font-weight: 600;
      color: #1e293b;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .stat-value {
      font-size: 20pt;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 9pt;
      color: #64748b;
    }
    .progress-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 11pt;
      font-weight: 600;
      color: white;
      background: ${progressTrendColor};
    }
    .mood-distribution {
      display: flex;
      gap: 20px;
      justify-content: space-around;
      margin-top: 15px;
    }
    .mood-item {
      text-align: center;
      flex: 1;
    }
    .mood-emoji {
      font-size: 30pt;
      margin-bottom: 5px;
    }
    .mood-count {
      font-size: 14pt;
      font-weight: 600;
      color: #1e293b;
    }
    .mood-label {
      font-size: 9pt;
      color: #64748b;
    }
    .activity-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .activity-table th {
      background: #f1f5f9;
      padding: 10px;
      text-align: left;
      font-size: 10pt;
      color: #475569;
      border-bottom: 2px solid #cbd5e1;
    }
    .activity-table td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10pt;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 9pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Отчет о прогрессе ребенка</h1>
    <p class="period">Период: ${fromDate} - ${toDate}</p>
    <p class="period">Сформирован: ${generatedAt}</p>
  </div>

  <div class="section">
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Ребенок</div>
        <div class="info-value">${data.childName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Родитель</div>
        <div class="info-value">${data.parentName}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Общая статистика</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${data.stats.totalAssignments}</div>
        <div class="stat-label">Всего заданий</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats.completedAssignments}</div>
        <div class="stat-label">Выполнено</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats.completionRate}%</div>
        <div class="stat-label">Процент выполнения</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${data.stats.totalReports}</div>
        <div class="stat-label">Отчетов</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats.averageDuration}</div>
        <div class="stat-label">Средняя длительность (мин)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value"><span class="progress-badge">${progressTrendLabel}</span></div>
        <div class="stat-label">Динамика прогресса</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Настроение ребенка</h2>
    <div class="mood-distribution">
      <div class="mood-item">
        <div class="mood-emoji">😊</div>
        <div class="mood-count">${data.stats.moodDistribution.good}</div>
        <div class="mood-label">Хорошее</div>
      </div>
      <div class="mood-item">
        <div class="mood-emoji">😐</div>
        <div class="mood-count">${data.stats.moodDistribution.neutral}</div>
        <div class="mood-label">Нейтральное</div>
      </div>
      <div class="mood-item">
        <div class="mood-emoji">😔</div>
        <div class="mood-count">${data.stats.moodDistribution.difficult}</div>
        <div class="mood-label">Сложное</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Последняя активность</h2>
    <table class="activity-table">
      <thead>
        <tr>
          <th>Дата</th>
          <th>Заданий выполнено</th>
          <th>Отчетов отправлено</th>
        </tr>
      </thead>
      <tbody>
        ${data.recentActivity.map(activity => `
          <tr>
            <td>${format(new Date(activity.date), 'd MMMM yyyy', { locale: ru })}</td>
            <td>${activity.assignmentsCompleted}</td>
            <td>${activity.reportsSubmitted}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Платформа Neiro - Аналитика и отчеты</p>
    <p>Этот отчет создан автоматически для информирования родителей о прогрессе ребенка</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate HTML for Specialist Analytics Report
   */
  private generateSpecialistReportHTML(data: SpecialistReportData): string {
    const fromDate = format(new Date(data.period.from), 'd MMMM yyyy', { locale: ru });
    const toDate = format(new Date(data.period.to), 'd MMMM yyyy', { locale: ru });
    const generatedAt = format(new Date(), 'd MMMM yyyy, HH:mm', { locale: ru });

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Аналитический отчет - ${data.specialistName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #1e293b;
      background: #fff;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #8b5cf6;
    }
    .header h1 {
      color: #6d28d9;
      font-size: 24pt;
      margin-bottom: 10px;
    }
    .header .period {
      color: #64748b;
      font-size: 11pt;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 16pt;
      font-weight: 600;
      color: #6d28d9;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e2e8f0;
    }
    .info-item {
      background: #faf5ff;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #8b5cf6;
      margin-bottom: 15px;
    }
    .info-label {
      font-size: 10pt;
      color: #64748b;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 14pt;
      font-weight: 600;
      color: #1e293b;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: #faf5ff;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e9d5ff;
    }
    .stat-value {
      font-size: 20pt;
      font-weight: 700;
      color: #8b5cf6;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 9pt;
      color: #64748b;
    }
    .children-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .children-table th {
      background: #f5f3ff;
      padding: 10px;
      text-align: left;
      font-size: 10pt;
      color: #475569;
      border-bottom: 2px solid #ddd6fe;
    }
    .children-table td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10pt;
    }
    .completion-bar {
      background: #e2e8f0;
      height: 20px;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
    }
    .completion-fill {
      background: linear-gradient(90deg, #8b5cf6, #a78bfa);
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 9pt;
      font-weight: 600;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 9pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Аналитический отчет специалиста</h1>
    <p class="period">Период: ${fromDate} - ${toDate}</p>
    <p class="period">Сформирован: ${generatedAt}</p>
  </div>

  <div class="section">
    <div class="info-item">
      <div class="info-label">Специалист</div>
      <div class="info-value">${data.specialistName}</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Общая статистика работы</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${data.stats.totalChildren}</div>
        <div class="stat-label">Детей в работе</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats.totalAssignments}</div>
        <div class="stat-label">Создано заданий</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats.totalReports}</div>
        <div class="stat-label">Проверено отчетов</div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${data.stats.averageReviewTime}ч</div>
        <div class="stat-label">Среднее время проверки</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats.approvalRate}%</div>
        <div class="stat-label">Процент одобренных</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">-</div>
        <div class="stat-label">Резерв</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Прогресс детей</h2>
    <table class="children-table">
      <thead>
        <tr>
          <th>Ребенок</th>
          <th>Процент выполнения</th>
          <th>Последняя активность</th>
        </tr>
      </thead>
      <tbody>
        ${data.childrenProgress.map(child => `
          <tr>
            <td>${child.childName}</td>
            <td>
              <div class="completion-bar">
                <div class="completion-fill" style="width: ${child.completionRate}%">
                  ${child.completionRate}%
                </div>
              </div>
            </td>
            <td>${child.lastActivity ? format(new Date(child.lastActivity), 'd MMM yyyy', { locale: ru }) : 'Нет данных'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Платформа Neiro - Аналитика и отчеты</p>
    <p>Этот отчет создан для анализа работы специалиста и прогресса детей</p>
  </div>
</body>
</html>
    `;
  }
}

// Singleton instance
export const pdfService = new PDFService();
