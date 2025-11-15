/**
 * MinIO Client
 * 
 * Клиент для работы с MinIO (S3-compatible storage)
 */

import { Client } from 'minio';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'minio';
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000');
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin123';
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';

/**
 * MinIO клиент (singleton)
 */
export const minioClient = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY
});

/**
 * Названия buckets
 */
export const BUCKETS = {
  EXERCISES: process.env.MINIO_BUCKET_EXERCISES || 'exercises',
  REPORTS: process.env.MINIO_BUCKET_REPORTS || 'reports',
  MEDIA: process.env.MINIO_BUCKET_MEDIA || 'media'
};

/**
 * Инициализация buckets (создание если не существуют)
 */
export async function initializeBuckets(): Promise<void> {
  try {
    for (const [name, bucket] of Object.entries(BUCKETS)) {
      const exists = await minioClient.bucketExists(bucket);
      
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1');
        console.log(`✅ MinIO bucket создан: ${bucket}`);
        
        // Установка публичной политики для чтения
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`]
            }
          ]
        };
        
        await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
        console.log(`✅ MinIO bucket политика установлена: ${bucket}`);
      }
    }
    
    console.log('✅ MinIO инициализирован');
  } catch (error) {
    console.error('❌ Ошибка инициализации MinIO:', error);
    throw error;
  }
}

/**
 * Получение URL файла в MinIO
 */
export function getFileUrl(bucket: string, objectName: string): string {
  const protocol = MINIO_USE_SSL ? 'https' : 'http';
  const port = MINIO_PORT === 80 || MINIO_PORT === 443 ? '' : `:${MINIO_PORT}`;
  
  return `${protocol}://${MINIO_ENDPOINT}${port}/${bucket}/${objectName}`;
}


