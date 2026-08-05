import { Router } from 'express';
import { uploadFile } from '../controllers/uploads.js';

const router = Router();
router.post('/', uploadFile);

export default router;
