import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getPreferences, updatePreferences } from '../controllers/preferences.controller';

const router = Router();

router.use(authenticate);

router.get('/', getPreferences);
router.patch('/', updatePreferences);

export default router;

