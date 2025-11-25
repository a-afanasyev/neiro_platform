import { Router } from 'express';
import { MediaController } from '../controllers/media.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const mediaController = new MediaController();

// All routes require authentication
router.use(authenticate);

// Generate presigned URL for upload
router.post(
  '/upload',
  mediaController.generateUploadUrl.bind(mediaController)
);

// Confirm upload and get file metadata
router.post(
  '/:mediaId/confirm',
  mediaController.confirmUpload.bind(mediaController)
);

// Get download URL for media
router.get(
  '/:mediaId/download',
  mediaController.getDownloadUrl.bind(mediaController)
);

export default router;
