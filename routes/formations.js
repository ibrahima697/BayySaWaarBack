import express from 'express';
import {
  getAllFormations,
  getFormationById,
  registerToFormation,
  createFormation,
  updateFormation,
  deleteFormation,
  updateRegistrationStatus
} from '../controllers/formationController.js';
import { protect, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllFormations);
router.get('/:id', getFormationById);

// Route membre (protégée)
router.post('/:id/register', protect, registerToFormation);
router.post('/', protect, isAdmin, createFormation);
// Route admin
router.post('/', protect, isAdmin, createFormation);
router.put('/:id', protect, isAdmin, updateFormation);
router.delete('/:id', protect, isAdmin, deleteFormation);

// Route admin pour statut
router.put('/:id/registrations/:regId', protect, isAdmin, updateRegistrationStatus);

export default router;
