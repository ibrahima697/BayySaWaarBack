import { Router } from 'express';
const router = Router();
import { submitContact, subscribeNewsletter, getAllContacts, updateContactStatus } from '../controllers/contactController.js';
import validate from '../middlewares/validate.js'; // Import par défaut
import {protect}  from '../middlewares/auth.js';

router.post('/submit', validate.contactValidation, submitContact); // Accès via validate.contactValidation
router.post('/newsletter', subscribeNewsletter);
router.get('/', protect, getAllContacts);
router.patch('/:id', protect, updateContactStatus);

export default router;
