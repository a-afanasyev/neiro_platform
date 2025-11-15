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
  const existingTemplate = await prisma.routeTemplate.findUnique({
    where: { slug: data.slug }
  });

  if (existingTemplate) {
    throw new AppError('Шаблон с таким slug уже существует', 409, 'DUPLICATE_SLUG');
  }

  const template = await prisma.routeTemplate.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      ageMin: data.ageMin,
      ageMax: data.ageMax,
      durationWeeks: data.durationWeeks,
      version: 1,
      isPublished: false,
      createdById: userId
    }
  });

  console.log(`✅ Создан шаблон: ${template.name} (${template.id})`);

  return template;
}

export async function listTemplates(
  query: ListTemplatesQuery
): Promise<{ data: RouteTemplate[]; meta: { total: number; hasMore: boolean; nextCursor?: string } }> {
  const { published, search, limit = 20, cursor } = query;

  const where: any = {};

  if (published !== undefined) {
    where.isPublished = published;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
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
        orderBy: { orderIndex: 'asc' }
      },
      goals: true,
      milestones: true
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

  if (data.slug && data.slug !== existingTemplate.slug) {
    const slugExists = await prisma.routeTemplate.findUnique({
      where: { slug: data.slug }
    });

    if (slugExists) {
      throw new AppError('Шаблон с таким slug уже существует', 409, 'DUPLICATE_SLUG');
    }
  }

  // Увеличение версии при обновлении опубликованного шаблона
  const newVersion = existingTemplate.isPublished ? existingTemplate.version + 1 : existingTemplate.version;

  const template = await prisma.routeTemplate.update({
    where: { id },
    data: {
      ...data,
      version: newVersion,
      updatedAt: new Date()
    }
  });

  const updatedFields = Object.keys(data);
  await eventsService.publishTemplateUpdated(id, template.version, updatedFields, userId);

  console.log(`✅ Обновлен шаблон: ${template.name} (${template.id}) версия ${template.version}`);

  return template;
}

export async function publishTemplate(
  id: string,
  userId: string
): Promise<RouteTemplate> {
  const template = await getTemplateById(id);

  if (template.isPublished) {
    throw new AppError('Шаблон уже опубликован', 400, 'ALREADY_PUBLISHED');
  }

  const updatedTemplate = await prisma.routeTemplate.update({
    where: { id },
    data: { isPublished: true }
  });

  await eventsService.publishTemplatePublished(
    id,
    updatedTemplate.slug,
    updatedTemplate.version,
    userId
  );

  console.log(`✅ Опубликован шаблон: ${updatedTemplate.name} (${updatedTemplate.id})`);

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
      isPublished: false,
      slug: `${template.slug}-archived-${Date.now()}`
    }
  });

  await eventsService.publishTemplateArchived(
    id,
    'Archived by admin',
    userId
  );

  console.log(`✅ Архивирован шаблон: ${template.name} (${template.id})`);
}

export async function cloneTemplate(
  id: string,
  data: CloneTemplateInput,
  userId: string
): Promise<RouteTemplate> {
  const sourceTemplate = await getTemplateById(id);

  const slugExists = await prisma.routeTemplate.findUnique({
    where: { slug: data.slug }
  });

  if (slugExists) {
    throw new AppError('Шаблон с таким slug уже существует', 409, 'DUPLICATE_SLUG');
  }

  const clonedTemplate = await prisma.routeTemplate.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: sourceTemplate.description,
      ageMin: sourceTemplate.ageMin,
      ageMax: sourceTemplate.ageMax,
      durationWeeks: sourceTemplate.durationWeeks,
      version: 1,
      isPublished: false,
      createdById: userId
    }
  });

  console.log(`✅ Клонирован шаблон: ${clonedTemplate.name} (${clonedTemplate.id})`);

  return clonedTemplate;
}


