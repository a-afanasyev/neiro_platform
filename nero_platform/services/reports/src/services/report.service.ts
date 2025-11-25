import { PrismaClient, Report, Prisma } from '@neiro/database';
import { CreateReportInput, UpdateReportInput, ReviewReportInput, ListReportsQuery } from '../validators/report.validator';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { EventOutboxService } from './eventOutbox.service';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export class ReportService {
  private eventOutbox: EventOutboxService;

  constructor() {
    this.eventOutbox = new EventOutboxService();
  }

  async createReport(data: CreateReportInput, parentId: string): Promise<Report> {
    try {
      // Validate assignment exists and belongs to parent's child
      const assignment = await prisma.assignment.findUnique({
        where: { id: data.assignmentId },
        include: {
          child: {
            include: {
              parents: {
                where: { parentUserId: parentId }
              }
            }
          }
        }
      });

      if (!assignment) {
        throw new NotFoundError('Assignment not found');
      }

      if (assignment.child.parents.length === 0) {
        throw new ValidationError('Assignment does not belong to your child');
      }

      // Create report
      const report = await prisma.report.create({
        data: {
          assignmentId: data.assignmentId,
          parentId,
          durationMinutes: data.durationMinutes,
          status: data.status,
          childMood: data.childMood,
          feedbackText: data.feedbackText,
          media: data.media ? (data.media as any) : Prisma.JsonNull,
          reviewStatus: 'not_reviewed'
        },
        include: {
          assignment: {
            include: {
              child: true,
              route: true
            }
          }
        }
      });

      // Emit event to EventOutbox
      await this.eventOutbox.createEvent({
        aggregateId: report.id,
        aggregateType: 'Report',
        eventType: 'reports.report.submitted',
        payload: {
          reportId: report.id,
          assignmentId: report.assignmentId,
          childId: assignment.childId,
          parentId,
          status: report.status,
          childMood: report.childMood,
          submittedAt: report.submittedAt
        }
      });

      logger.info('Report created', { reportId: report.id, assignmentId: data.assignmentId });

      return report;
    } catch (error) {
      logger.error('Failed to create report', { error, data });
      throw error;
    }
  }

  async getReports(query: ListReportsQuery, userId: string, userRole: string) {
    const { page, limit, fromDate, toDate, ...filters } = query;
    const skip = (page - 1) * limit;

    // Build where clause based on user role
    const where: Prisma.ReportWhereInput = {
      ...filters,
      ...(fromDate && { submittedAt: { gte: new Date(fromDate) } }),
      ...(toDate && { submittedAt: { lte: new Date(toDate) } })
    };

    // Parents can only see their own reports
    if (userRole === 'parent') {
      where.parentId = userId;
    }

    // Specialists can see reports for their assigned children
    if (userRole === 'specialist') {
      where.assignment = {
        child: {
          specialists: {
            some: {
              specialist: {
                userId
              }
            }
          }
        }
      };
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          assignment: {
            include: {
              child: true,
              route: true
            }
          },
          parent: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          reviews: true
        }
      }),
      prisma.report.count({ where })
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getReportById(id: string, userId: string, userRole: string): Promise<Report> {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        assignment: {
          include: {
            child: true,
            route: true,
            exercises: {
              include: {
                exercise: true
              }
            }
          }
        },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        reviews: true
      }
    });

    if (!report) {
      throw new NotFoundError('Report not found');
    }

    // Validate access
    if (userRole === 'parent' && report.parentId !== userId) {
      throw new ValidationError('Access denied');
    }

    if (userRole === 'specialist') {
      const hasAccess = await prisma.childSpecialist.findFirst({
        where: {
          childId: report.assignment.childId,
          specialist: {
            userId
          }
        }
      });

      if (!hasAccess) {
        throw new ValidationError('Access denied');
      }
    }

    return report;
  }

  async reviewReport(
    id: string,
    data: ReviewReportInput,
    specialistUserId: string
  ): Promise<Report> {
    // Get specialist profile
    const specialist = await prisma.specialist.findUnique({
      where: { userId: specialistUserId }
    });

    if (!specialist) {
      throw new ValidationError('Only specialists can review reports');
    }

    // Get report and validate access
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        assignment: {
          include: {
            child: {
              include: {
                specialists: {
                  where: {
                    specialistId: specialist.id
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!report) {
      throw new NotFoundError('Report not found');
    }

    if (report.assignment.child.specialists.length === 0) {
      throw new ValidationError('You are not assigned to this child');
    }

    // Update report with review
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        reviewStatus: data.reviewStatus,
        reviewedAt: new Date(),
        reviewedBy: specialistUserId
      },
      include: {
        assignment: {
          include: {
            child: true
          }
        }
      }
    });

    // Create review record if notes provided
    if (data.notes) {
      await prisma.reportReview.create({
        data: {
          reportId: id,
          specialistId: specialist.id,
          reviewStatus: data.reviewStatus,
          notes: data.notes
        }
      });
    }

    // Emit event
    await this.eventOutbox.createEvent({
      aggregateId: id,
      aggregateType: 'Report',
      eventType: 'reports.report.reviewed',
      payload: {
        reportId: id,
        assignmentId: report.assignmentId,
        childId: report.assignment.childId,
        parentId: report.parentId,
        specialistId: specialist.id,
        reviewStatus: data.reviewStatus,
        reviewedAt: updatedReport.reviewedAt
      }
    });

    logger.info('Report reviewed', { reportId: id, reviewStatus: data.reviewStatus });

    return updatedReport;
  }

  async deleteReport(id: string, userId: string, userRole: string): Promise<void> {
    const report = await this.getReportById(id, userId, userRole);

    // Only parent who created the report can delete it within 24 hours
    if (userRole !== 'parent' || report.parentId !== userId) {
      throw new ValidationError('Only the report creator can delete it');
    }

    const hoursSinceSubmission =
      (Date.now() - new Date(report.submittedAt).getTime()) / (1000 * 60 * 60);

    if (hoursSinceSubmission > 24) {
      throw new ValidationError('Reports can only be deleted within 24 hours of submission');
    }

    await prisma.report.delete({
      where: { id }
    });

    logger.info('Report deleted', { reportId: id });
  }
}
