/**
 * Templates Service
 * 
 * Бизнес-логика управления шаблонами маршрутов
 */

import { PrismaClient, RouteTemplate } from '@neiro/database';
import { AppError } from '../utils/AppError';
import { 
  CreateTemplateInput, 
  UpdateTemplateInput, 
  ListTemplatesQuery,
  CloneTemplateInput
} from '../validators/templates.validators';
import * as eventsService from './events.service';

const prisma = new PrismaClient();

export async function createTemplate(
  data: CreateTemplateInput,
  userId: string
): Promise<RouteTemplate> {
  // Создаем шаблон с фазами и целями в транзакции
  const template = await prisma.$transaction(async (tx) => {
    // Создаем основной шаблон
    const newTemplate = await tx.routeTemplate.create({
      data: {
        title: data.title,
        description: data.description,
        targetAgeRange: data.targetAgeRange,
        severityLevel: data.severityLevel,
        version: 1,
        status: 'draft'
      }
    });

    // Создаем фазы если переданы
    if (data.phases && data.phases.length > 0) {
      for (const phase of data.phases) {
        await tx.templatePhase.create({
          data: {
            templateId: newTemplate.id,
            name: phase.name,
            description: phase.description,
            orderIndex: phase.orderIndex,
            durationWeeks: phase.durationWeeks,
            specialtyHint: phase.specialtyHint,
            notes: phase.notes
          }
        });
      }
    }

    // Создаем цели если переданы (на уровне шаблона, без привязки к фазе)
    if (data.goals && data.goals.length > 0) {
      for (const goal of data.goals) {
        await tx.templateGoal.create({
          data: {
            templateId: newTemplate.id,
            description: goal.description,
            category: goal.category,
            goalType: goal.goalType || 'skill',
            targetMetric: goal.targetMetric,
            measurementUnit: goal.measurementUnit,
            baselineGuideline: goal.baselineGuideline,
            targetGuideline: goal.targetGuideline,
            priority: goal.priority || 'medium',
            notes: goal.notes
          }
        });
      }
    }

    return newTemplate;
  });

  console.log(`✅ Создан шаблон: ${template.title} (${template.id})`);

  return template;
}

export async function listTemplates(
  query: ListTemplatesQuery
): Promise<{ data: RouteTemplate[]; meta: { total: number; hasMore: boolean; nextCursor?: string } }> {
  const { status, search, limit = 20, cursor } = query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  const paginationOptions: any = {
    take: limit + 1,
    orderBy: { createdAt: 'desc' }
  };

  if (cursor) {
    paginationOptions.cursor = { id: cursor };
    paginationOptions.skip = 1;
  }

  const templates = await prisma.routeTemplate.findMany({
    where,
    ...paginationOptions
  });

  const hasMore = templates.length > limit;
  const data = hasMore ? templates.slice(0, limit) : templates;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;

  const total = await prisma.routeTemplate.count({ where });

  return {
    data,
    meta: {
      total,
      hasMore,
      nextCursor
    }
  };
}

export async function getTemplateById(id: string): Promise<RouteTemplate> {
  const template = await prisma.routeTemplate.findUnique({
    where: { id },
    include: {
      phases: {
        orderBy: { orderIndex: 'asc' },
        include: {
          goals: true,
          milestones: true,
          exercises: true
        }
      },
      goals: true
    }
  });

  if (!template) {
    throw new AppError('Шаблон не найден', 404, 'TEMPLATE_NOT_FOUND');
  }

  return template;
}

export async function updateTemplate(
  id: string,
  data: UpdateTemplateInput,
  userId: string
): Promise<RouteTemplate> {
  const existingTemplate = await getTemplateById(id);

  // Увеличение версии при обновлении опубликованного шаблона
  const newVersion = existingTemplate.status === 'published' ? existingTemplate.version + 1 : existingTemplate.version;

  const template = await prisma.routeTemplate.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      targetAgeRange: data.targetAgeRange,
      severityLevel: data.severityLevel,
      version: newVersion,
      updatedAt: new Date()
    }
  });

  const updatedFields = Object.keys(data);
  await eventsService.publishTemplateUpdated(id, template.version, updatedFields, userId);

  console.log(`✅ Обновлен шаблон: ${template.title} (${template.id}) версия ${template.version}`);

  return template;
}

export async function publishTemplate(
  id: string,
  userId: string
): Promise<RouteTemplate> {
  const template = await getTemplateById(id);

  if (template.status === 'published') {
    throw new AppError('Шаблон уже опубликован', 400, 'ALREADY_PUBLISHED');
  }

  const updatedTemplate = await prisma.routeTemplate.update({
    where: { id },
    data: {
      status: 'published',
      publishedAt: new Date()
    }
  });

  await eventsService.publishTemplatePublished(
    id,
    updatedTemplate.title,
    updatedTemplate.version,
    userId
  );

  console.log(`✅ Опубликован шаблон: ${updatedTemplate.title} (${updatedTemplate.id})`);

  return updatedTemplate;
}

export async function archiveTemplate(
  id: string,
  userId: string
): Promise<void> {
  const template = await getTemplateById(id);

  await prisma.routeTemplate.update({
    where: { id },
    data: {
      status: 'archived'
    }
  });

  await eventsService.publishTemplateArchived(
    id,
    'Archived by admin',
    userId
  );

  console.log(`✅ Архивирован шаблон: ${template.title} (${template.id})`);
}

export async function cloneTemplate(
  id: string,
  data: CloneTemplateInput,
  userId: string
): Promise<RouteTemplate> {
  const sourceTemplate = await getTemplateById(id);

  // Клонируем шаблон с фазами, целями и контрольными точками в транзакции
  const clonedTemplate = await prisma.$transaction(async (tx) => {
    // Создаем новый шаблон
    const newTemplate = await tx.routeTemplate.create({
      data: {
        title: data.title,
        description: sourceTemplate.description,
        targetAgeRange: sourceTemplate.targetAgeRange,
        severityLevel: sourceTemplate.severityLevel,
        version: 1,
        status: 'draft'
      }
    });

    // Маппинг старых ID фаз на новые для связывания целей
    const phaseIdMap = new Map<string, string>();

    // Клонируем фазы
    if (sourceTemplate.phases && sourceTemplate.phases.length > 0) {
      for (const phase of sourceTemplate.phases) {
        const newPhase = await tx.templatePhase.create({
          data: {
            templateId: newTemplate.id,
            name: phase.name,
            description: phase.description,
            orderIndex: phase.orderIndex,
            durationWeeks: phase.durationWeeks,
            specialtyHint: phase.specialtyHint,
            notes: phase.notes
          }
        });

        phaseIdMap.set(phase.id, newPhase.id);

        // Клонируем контрольные точки фазы
        if (phase.milestones && phase.milestones.length > 0) {
          for (const milestone of phase.milestones) {
            await tx.templateMilestone.create({
              data: {
                templatePhaseId: newPhase.id,
                title: milestone.title,
                description: milestone.description,
                checkpointType: milestone.checkpointType,
                dueWeek: milestone.dueWeek,
                successCriteria: milestone.successCriteria
              }
            });
          }
        }

        // Клонируем упражнения фазы
        if (phase.exercises && phase.exercises.length > 0) {
          for (const exercise of phase.exercises) {
            await tx.templateExercise.create({
              data: {
                templatePhaseId: newPhase.id,
                exerciseId: exercise.exerciseId,
                orderIndex: exercise.orderIndex,
                frequencyPerWeek: exercise.frequencyPerWeek,
                durationMinutes: exercise.durationMinutes,
                notes: exercise.notes
              }
            });
          }
        }
      }
    }

    // Клонируем цели (привязываем к новым фазам)
    if (sourceTemplate.goals && sourceTemplate.goals.length > 0) {
      for (const goal of sourceTemplate.goals) {
        const newPhaseId = goal.templatePhaseId ? phaseIdMap.get(goal.templatePhaseId) : null;

        await tx.templateGoal.create({
          data: {
            templateId: newTemplate.id,
            templatePhaseId: newPhaseId,
            category: goal.category,
            goalType: goal.goalType,
            description: goal.description,
            targetMetric: goal.targetMetric,
            measurementUnit: goal.measurementUnit,
            baselineGuideline: goal.baselineGuideline,
            targetGuideline: goal.targetGuideline,
            priority: goal.priority,
            notes: goal.notes
          }
        });
      }
    }

    return newTemplate;
  });

  console.log(`✅ Клонирован шаблон: ${clonedTemplate.title} (${clonedTemplate.id}) с фазами и целями`);

  return clonedTemplate;
}


