import express from 'express';
import validate from '../middlewares/validate.js'; // Import par défaut
import * as authController from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', validate.registerValidation, authController.register); // Accès via validate.registerValidation
router.post('/login', authController.login);
router.get('/profile', protect, authController.getProfile);
//router.put('/profile', protect, validate.updateProfileValidation, authController.updateProfile); // Accès via validate.updateProfileValidation
//router.post('/logout', protect, authController.logout);
router.get('/me', authController.getMe);

export default router;
