import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  getUsersByRole,
  searchUsers,
  filterUsers,
  getUserStats,
  submitEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
  getMe,
  getEnrollmentStatus,
    deleteUser
} from '../controllers/adminController.js';
import {protect, isAdmin}  from '../middlewares/auth.js';
//import  isAdmin  from '../middlewares/isAdmin.js';

const router = express.Router();

router.get('/stats', protect, isAdmin, getAdminStats);
router.get('/users', protect, isAdmin, getAllUsers);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.get('/users/role/:role', protect, isAdmin, getUsersByRole);
router.get('/users/search', protect, isAdmin, searchUsers);
router.get('/users/filter', protect, isAdmin, filterUsers);
router.get('/user-stats', protect, isAdmin, getUserStats);
router.post('/enrollments', protect, isAdmin, submitEnrollment);
router.get('/enrollments', protect, isAdmin, getAllEnrollments);
router.get('/enrollments/:id', protect, isAdmin, getEnrollmentById);
router.put('/enrollments/:id', protect, isAdmin, updateEnrollment);
router.delete('/enrollments/:id', protect, isAdmin, deleteEnrollment);
router.get('/me', protect, isAdmin, getMe);
router.get('/enrollment-status', protect, isAdmin, getEnrollmentStatus);

export default router;
