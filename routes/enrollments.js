import express from 'express';
import { submitEnrollment, getAllEnrollments, getEnrollmentById, updateEnrollment, deleteEnrollment, getEnrollmentStatus } from '../controllers/enrollmentController.js';
import validate from '../middlewares/validate.js';
import {protect, isAdmin}  from '../middlewares/auth.js';

import { uploadEnrollmentImages, handleUploadError } from '../middlewares/cloudinaryUpload.js';

const router = express.Router();

router.post('/submit', uploadEnrollmentImages, handleUploadError, submitEnrollment);
router.get('/my-status', protect, getEnrollmentStatus);
router.get('/', protect, isAdmin, getAllEnrollments);
router.get('/:id', protect, isAdmin, getEnrollmentById);
router.put('/:id', protect, isAdmin, updateEnrollment);
router.delete('/:id', protect, isAdmin, deleteEnrollment);

export default router;
