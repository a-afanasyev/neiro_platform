import { Request, Response } from 'express';
import { pdfService } from '../services/pdf.service';
import { statsService } from '../services/stats.service';
import { logger } from '../utils/logger';
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler';
import { subDays } from 'date-fns';

/**
 * PDF Reports Controller
 *
 * Handles PDF generation requests with RBAC checks
 */

/**
 * Generate child progress report PDF
 * Accessible by: Parent (own child), Specialist (assigned child), Admin/Supervisor
 */
export const generateChildReportPDF = async (req: Request, res: Response) => {
  try {
    const { childId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    const user = req.user!;

    if (!childId || !childId.match(/^[0-9a-f-]{36}$/)) {
      throw new ValidationError('Invalid child ID');
    }

    if (days < 1 || days > 365) {
      throw new ValidationError('Days must be between 1 and 365');
    }

    // RBAC check for parents
    if (user.role === 'parent') {
      const { PrismaClient } = await import('@neiro/database');
      const prisma = new PrismaClient();

      const childParent = await prisma.childParent.findFirst({
        where: {
          childId,
          parentUserId: user.userId,
        },
      });

      if (!childParent) {
        throw new ForbiddenError('Access denied');
      }
      await prisma.$disconnect();
    }

    // Get child stats
    const stats = await statsService.getChildStats(childId, days);

    if (!stats) {
      throw new NotFoundError('Child not found');
    }

    // Prepare PDF data
    const periodFrom = subDays(new Date(), days).toISOString();
    const periodTo = new Date().toISOString();

    const pdfData = {
      childId: stats.childId,
      childName: stats.childName,
      parentName: 'Родитель', // TODO: Get from user info
      period: {
        from: periodFrom,
        to: periodTo,
      },
      stats: {
        totalAssignments: stats.totalAssignments,
        completedAssignments: stats.completedAssignments,
        completionRate: stats.completionRate,
        totalReports: stats.totalReports,
        averageDuration: stats.averageDuration,
        moodDistribution: stats.moodDistribution,
        progressTrend: stats.progressTrend,
      },
      recentActivity: stats.recentActivity,
    };

    // Generate PDF
    logger.info('Generating child report PDF', { childId, days, userId: user.userId });
    const pdfBuffer = await pdfService.generateChildReport(pdfData);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="child-report-${childId}-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    logger.info('Child report PDF generated successfully', { childId, userId: user.userId });
  } catch (error: any) {
    logger.error('Error generating child report PDF', { error, childId: req.params.childId });
    throw error;
  }
};

/**
 * Generate specialist analytics report PDF
 * Accessible by: Specialist (own report), Admin/Supervisor (any specialist)
 */
export const generateSpecialistReportPDF = async (req: Request, res: Response) => {
  try {
    const { specialistId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    const user = req.user!;

    if (!specialistId || !specialistId.match(/^[0-9a-f-]{36}$/)) {
      throw new ValidationError('Invalid specialist ID');
    }

    if (days < 1 || days > 365) {
      throw new ValidationError('Days must be between 1 and 365');
    }

    // RBAC: Specialist can only see own report, Admin/Supervisor can see any
    if (user.role === 'specialist' && user.userId !== specialistId) {
      throw new ForbiddenError('You can only view your own report');
    }

    // Get specialist stats
    const stats = await statsService.getSpecialistStats(specialistId, days);

    if (!stats) {
      throw new NotFoundError('Specialist not found');
    }

    // Prepare PDF data
    const periodFrom = subDays(new Date(), days).toISOString();
    const periodTo = new Date().toISOString();

    const pdfData = {
      specialistId: stats.specialistId,
      specialistName: stats.specialistName,
      period: {
        from: periodFrom,
        to: periodTo,
      },
      stats: {
        totalChildren: stats.totalChildren,
        totalAssignments: stats.totalAssignments,
        totalReports: stats.totalReports,
        averageReviewTime: stats.averageReviewTime,
        approvalRate: stats.approvalRate,
      },
      childrenProgress: stats.childrenProgress,
    };

    // Generate PDF
    logger.info('Generating specialist report PDF', { specialistId, days, userId: user.userId });
    const pdfBuffer = await pdfService.generateSpecialistReport(pdfData);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="specialist-report-${specialistId}-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);

    logger.info('Specialist report PDF generated successfully', { specialistId, userId: user.userId });
  } catch (error: any) {
    logger.error('Error generating specialist report PDF', { error, specialistId: req.params.specialistId });
    throw error;
  }
};
