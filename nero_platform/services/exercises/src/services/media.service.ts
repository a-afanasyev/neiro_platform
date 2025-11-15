/**
 * Media Service
 * 
 * Сервис для загрузки и управления медиа-файлами в MinIO
 */

import { minioClient, BUCKETS, getFileUrl } from './minio.client';
import { AppError } from '../utils/AppError';
import * as path from 'path';

/**
 * Допустимые MIME типы для медиа
 */
const ALLOWED_MIME_TYPES = {
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
};

/**
 * Максимальный размер файла (50 MB)
 */
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB в байтах

/**
 * Валидация MIME типа файла
 */
export function validateMimeType(mimeType: string): { valid: boolean; mediaType?: string } {
  for (const [mediaType, allowedTypes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (allowedTypes.includes(mimeType)) {
      return { valid: true, mediaType };
    }
  }
  
  return { valid: false };
}

/**
 * Генерация уникального имени файла
 */
export function generateFileName(originalName: string, exerciseId: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return `exercises/${exerciseId}/${timestamp}-${random}${ext}`;
}

/**
 * Загрузка медиа-файла в MinIO
 */
export async function uploadMedia(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  exerciseId: string
): Promise<{ url: string; objectName: string; mediaType: string }> {
  // Валидация MIME типа
  const { valid, mediaType } = validateMimeType(mimeType);
  if (!valid) {
    throw new AppError(
      `Недопустимый тип файла: ${mimeType}. Разрешены: video/mp4, video/webm, image/jpeg, image/png, image/webp, audio/mpeg, audio/wav`,
      400,
      'INVALID_MIME_TYPE'
    );
  }

  // Валидация размера файла
  if (buffer.length > MAX_FILE_SIZE) {
    throw new AppError(
      `Размер файла превышает допустимый (50 MB). Текущий размер: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
      400,
      'FILE_TOO_LARGE'
    );
  }

  // Генерация имени файла
  const objectName = generateFileName(originalName, exerciseId);

  try {
    // Загрузка в MinIO
    await minioClient.putObject(
      BUCKETS.EXERCISES,
      objectName,
      buffer,
      buffer.length,
      {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000' // 1 год
      }
    );

    // Получение URL файла
    const url = getFileUrl(BUCKETS.EXERCISES, objectName);

    console.log(`✅ Медиа загружено: ${objectName} (${(buffer.length / 1024).toFixed(2)} KB)`);

    return {
      url,
      objectName,
      mediaType: mediaType!
    };
  } catch (error) {
    console.error('❌ Ошибка загрузки медиа в MinIO:', error);
    throw new AppError(
      'Не удалось загрузить медиа-файл',
      500,
      'MEDIA_UPLOAD_FAILED'
    );
  }
}

/**
 * Удаление медиа-файла из MinIO
 */
export async function deleteMedia(objectName: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKETS.EXERCISES, objectName);
    console.log(`✅ Медиа удалено: ${objectName}`);
  } catch (error) {
    console.error('❌ Ошибка удаления медиа из MinIO:', error);
    throw new AppError(
      'Не удалось удалить медиа-файл',
      500,
      'MEDIA_DELETE_FAILED'
    );
  }
}

/**
 * Удаление всех медиа-файлов упражнения
 */
export async function deleteExerciseMedia(exerciseId: string): Promise<void> {
  try {
    const prefix = `exercises/${exerciseId}/`;
    const objectsList = await minioClient.listObjects(BUCKETS.EXERCISES, prefix, true);

    const objectNames: string[] = [];
    
    for await (const obj of objectsList) {
      if (obj.name) {
        objectNames.push(obj.name);
      }
    }

    if (objectNames.length > 0) {
      await minioClient.removeObjects(BUCKETS.EXERCISES, objectNames);
      console.log(`✅ Удалено ${objectNames.length} медиа-файлов упражнения ${exerciseId}`);
    }
  } catch (error) {
    console.error('❌ Ошибка удаления медиа упражнения из MinIO:', error);
    throw new AppError(
      'Не удалось удалить медиа-файлы упражнения',
      500,
      'MEDIA_DELETE_FAILED'
    );
  }
}

/**
 * Получение информации о медиа-файле
 */
export async function getMediaInfo(objectName: string): Promise<{
  size: number;
  etag: string;
  lastModified: Date;
  contentType: string;
}> {
  try {
    const stat = await minioClient.statObject(BUCKETS.EXERCISES, objectName);
    
    return {
      size: stat.size,
      etag: stat.etag,
      lastModified: stat.lastModified,
      contentType: stat.metaData?.['content-type'] || 'application/octet-stream'
    };
  } catch (error) {
    console.error('❌ Ошибка получения информации о медиа:', error);
    throw new AppError(
      'Не удалось получить информацию о медиа-файле',
      404,
      'MEDIA_NOT_FOUND'
    );
  }
}


