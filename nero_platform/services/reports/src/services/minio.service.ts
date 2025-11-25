import { Client as MinioClient } from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export class MinioService {
  private client: MinioClient;
  private bucketName: string;
  private thumbnailBucket: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT || '9000');
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin123';

    this.bucketName = process.env.MINIO_BUCKET_REPORTS || 'neiro-reports';
    this.thumbnailBucket = process.env.MINIO_BUCKET_THUMBNAILS || 'neiro-reports-thumbnails';

    this.client = new MinioClient({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey
    });

    logger.info('MinIO client initialized', {
      endpoint,
      port,
      useSSL,
      bucket: this.bucketName
    });
  }

  /**
   * Generate presigned URL for uploading a file
   */
  async generateUploadUrl(
    fileName: string,
    fileType: string,
    userId: string
  ): Promise<{
    uploadUrl: string;
    mediaId: string;
    fileKey: string;
  }> {
    try {
      const mediaId = uuidv4();
      const extension = fileName.split('.').pop() || '';
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileKey = `reports/${userId}/${mediaId}/${sanitizedFileName}`;

      // Generate presigned URL (valid for 15 minutes)
      const uploadUrl = await this.client.presignedPutObject(
        this.bucketName,
        fileKey,
        15 * 60 // 15 minutes
      );

      logger.info('Generated upload URL', {
        mediaId,
        fileKey,
        fileName,
        userId
      });

      return {
        uploadUrl,
        mediaId,
        fileKey
      };
    } catch (error) {
      logger.error('Failed to generate upload URL', { error, fileName, userId });
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Generate presigned URL for downloading a file
   */
  async generateDownloadUrl(fileKey: string, expirySeconds: number = 3600): Promise<string> {
    try {
      const url = await this.client.presignedGetObject(
        this.bucketName,
        fileKey,
        expirySeconds
      );

      logger.info('Generated download URL', { fileKey, expirySeconds });

      return url;
    } catch (error) {
      logger.error('Failed to generate download URL', { error, fileKey });
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Verify file exists after upload
   */
  async verifyFileExists(fileKey: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucketName, fileKey);
      return true;
    } catch (error) {
      logger.warn('File not found', { fileKey });
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileKey: string): Promise<{
    size: number;
    contentType: string;
    lastModified: Date;
  }> {
    try {
      const stat = await this.client.statObject(this.bucketName, fileKey);

      return {
        size: stat.size,
        contentType: stat.metaData['content-type'] || 'application/octet-stream',
        lastModified: stat.lastModified
      };
    } catch (error) {
      logger.error('Failed to get file metadata', { error, fileKey });
      throw new Error('Failed to get file metadata');
    }
  }

  /**
   * Delete file from MinIO
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucketName, fileKey);
      logger.info('File deleted', { fileKey });
    } catch (error) {
      logger.error('Failed to delete file', { error, fileKey });
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Upload thumbnail to public bucket
   */
  async uploadThumbnail(
    fileKey: string,
    thumbnailBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    try {
      const thumbnailKey = fileKey.replace('/reports/', '/thumbnails/');

      await this.client.putObject(
        this.thumbnailBucket,
        thumbnailKey,
        thumbnailBuffer,
        thumbnailBuffer.length,
        {
          'Content-Type': contentType
        }
      );

      // Generate public URL for thumbnail
      const thumbnailUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${this.thumbnailBucket}/${thumbnailKey}`;

      logger.info('Thumbnail uploaded', { thumbnailKey, size: thumbnailBuffer.length });

      return thumbnailUrl;
    } catch (error) {
      logger.error('Failed to upload thumbnail', { error, fileKey });
      throw new Error('Failed to upload thumbnail');
    }
  }
}
