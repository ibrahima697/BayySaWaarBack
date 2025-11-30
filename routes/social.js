import { Router } from 'express';
const router = Router();
import { setConfig, getConfigs, deleteConfig, fetchPosts } from '../controllers/socialController.js';
import {protect}  from '../middlewares/auth.js';

router.post('/config', protect, setConfig);
router.get('/config', protect, getConfigs);
router.delete('/config/:id', protect, deleteConfig);
router.get('/posts', fetchPosts);

export default router;
