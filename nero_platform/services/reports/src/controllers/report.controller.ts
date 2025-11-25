import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ReportService } from '../services/report.service';
import {
  createReportSchema,
  updateReportSchema,
  reviewReportSchema,
  listReportsQuerySchema
} from '../validators/report.validator';

const reportService = new ReportService();

export class ReportController {
  async createReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validation = createReportSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validation.error.errors
          }
        });
      }

      const report = await reportService.createReport(
        validation.data,
        req.user!.userId
      );

      res.status(201).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validation = listReportsQuerySchema.safeParse(req.query);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validation.error.errors
          }
        });
      }

      const result = await reportService.getReports(
        validation.data,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const report = await reportService.getReportById(
        id,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async reviewReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validation = reviewReportSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: validation.error.errors
          }
        });
      }

      const report = await reportService.reviewReport(
        id,
        validation.data,
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await reportService.deleteReport(id, req.user!.userId, req.user!.role);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
