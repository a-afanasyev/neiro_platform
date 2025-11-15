/**
 * Exercises Service
 * 
 * Бизнес-логика управления упражнениями
 */

import { PrismaClient, Exercise } from '@neiro/database';
import { AppError } from '../utils/AppError';
import { 
  CreateExerciseInput, 
  UpdateExerciseInput, 
  ListExercisesQuery 
} from '../validators/exercises.validators';
import * as eventsService from './events.service';

const prisma = new PrismaClient();

/**
 * Категории упражнений с переводом
 */
export const EXERCISE_CATEGORIES = {
  cognitive: 'Когнитивные',
  speech: 'Речевые',
  motor: 'Моторные',
  social: 'Социальные',
  sensory: 'Сенсорные',
  daily: 'Повседневные навыки'
};

/**
 * Создание нового упражнения
 */
export async function createExercise(
  data: CreateExerciseInput,
  userId: string
): Promise<Exercise> {
  // Проверка уникальности slug
  const existingExercise = await prisma.exercise.findUnique({
    where: { slug: data.slug }
  });

  if (existingExercise) {
    throw new AppError('Упражнение с таким slug уже существует', 409, 'DUPLICATE_SLUG');
  }

  const exercise = await prisma.exercise.create({
    data: {
      ...data,
      materials: data.materials as any,
      instructions: data.instructions as any,
      successCriteria: data.successCriteria as any,
      mediaAssets: data.mediaAssets as any
    }
  });

  console.log(`✅ Создано упражнение: ${exercise.title} (${exercise.id})`);

  return exercise;
}

/**
 * Получение списка упражнений с фильтрацией и пагинацией
 */
export async function listExercises(
  query: ListExercisesQuery,
  userId: string,
  userRole: string
): Promise<{ data: Exercise[]; meta: { total: number; hasMore: boolean; nextCursor?: string } }> {
  const { 
    category, 
    difficulty, 
    ageFrom, 
    ageTo, 
    search, 
    limit = 20, 
    cursor 
  } = query;

  // Формирование условий фильтрации
  const where: any = {};

  if (category) {
    where.category = category;
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (ageFrom !== undefined) {
    where.ageMax = { gte: ageFrom };
  }

  if (ageTo !== undefined) {
    where.ageMin = { lte: ageTo };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Cursor-based пагинация
  const paginationOptions: any = {
    take: limit + 1, // Берем на 1 больше для определения hasMore
    orderBy: { createdAt: 'desc' }
  };

  if (cursor) {
    paginationOptions.cursor = {
      id: cursor
    };
    paginationOptions.skip = 1; // Пропускаем сам cursor
  }

  const exercises = await prisma.exercise.findMany({
    where,
    ...paginationOptions
  });

  // Определение наличия следующей страницы
  const hasMore = exercises.length > limit;
  const data = hasMore ? exercises.slice(0, limit) : exercises;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;

  // Подсчет общего количества (кешируется)
  const total = await prisma.exercise.count({ where });

  return {
    data,
    meta: {
      total,
      hasMore,
      nextCursor
    }
  };
}

/**
 * Получение упражнения по ID
 */
export async function getExerciseById(id: string): Promise<Exercise> {
  const exercise = await prisma.exercise.findUnique({
    where: { id }
  });

  if (!exercise) {
    throw new AppError('Упражнение не найдено', 404, 'EXERCISE_NOT_FOUND');
  }

  return exercise;
}

/**
 * Обновление упражнения
 */
export async function updateExercise(
  id: string,
  data: UpdateExerciseInput,
  userId: string
): Promise<Exercise> {
  // Проверка существования упражнения
  const existingExercise = await getExerciseById(id);

  // Проверка уникальности slug (если изменился)
  if (data.slug && data.slug !== existingExercise.slug) {
    const slugExists = await prisma.exercise.findUnique({
      where: { slug: data.slug }
    });

    if (slugExists) {
      throw new AppError('Упражнение с таким slug уже существует', 409, 'DUPLICATE_SLUG');
    }
  }

  // Подготовка данных для обновления
  const updateData: any = { ...data };
  
  if (data.materials) {
    updateData.materials = data.materials as any;
  }
  if (data.instructions) {
    updateData.instructions = data.instructions as any;
  }
  if (data.successCriteria) {
    updateData.successCriteria = data.successCriteria as any;
  }
  if (data.mediaAssets) {
    updateData.mediaAssets = data.mediaAssets as any;
  }

  const exercise = await prisma.exercise.update({
    where: { id },
    data: updateData
  });

  // Публикация события
  const updatedFields = Object.keys(data);
  await eventsService.publishExerciseUpdated(id, updatedFields, userId);

  console.log(`✅ Обновлено упражнение: ${exercise.title} (${exercise.id})`);

  return exercise;
}

/**
 * Публикация упражнения
 */
export async function publishExercise(
  id: string,
  userId: string
): Promise<Exercise> {
  const exercise = await getExerciseById(id);

  // Публикация события (логика публикации через события)
  await eventsService.publishExercisePublished(
    id,
    exercise.slug,
    exercise.category,
    exercise.difficulty,
    userId
  );

  console.log(`✅ Опубликовано упражнение: ${exercise.title} (${exercise.id})`);

  return exercise;
}

/**
 * Архивация упражнения (soft delete)
 */
export async function deleteExercise(
  id: string,
  userId: string
): Promise<void> {
  const exercise = await getExerciseById(id);

  // Проверка, используется ли упражнение в активных маршрутах/назначениях
  // TODO: добавить проверку связей с маршрутами и назначениями

  await prisma.exercise.update({
    where: { id },
    data: { 
      slug: `${exercise.slug}-archived-${Date.now()}` // Освобождаем slug
    }
  });

  // Публикация события
  await eventsService.publishExerciseRetired(
    id,
    'Archived by admin',
    userId
  );

  console.log(`✅ Архивировано упражнение: ${exercise.title} (${exercise.id})`);
}

/**
 * Получение списка категорий с переводом
 */
export function getCategories() {
  return Object.entries(EXERCISE_CATEGORIES).map(([key, label]) => ({
    value: key,
    label
  }));
}


