import { Router } from 'express';
const router = Router();
import { getDashboardData } from '../controllers/dashboardController.js';
import {protect} from '../middlewares/auth.js';

router.get('/my-data', protect, getDashboardData);

export default router;
