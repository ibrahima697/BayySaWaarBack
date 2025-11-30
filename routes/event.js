// routes/eventRoutes.js
import express from 'express';
//import authMiddleware from '../middlewares/auth.js';
import {protect, isAdmin}  from '../middlewares/auth.js';

import {
  createEvent,
  getAllEvents,
  getEventBySlug,
  registerToEvent
} from '../controllers/eventController.js';

const router = express.Router();

router.route('/')
  .post(isAdmin, createEvent)
  .get(getAllEvents);

router.route('/:slug')
  .get(getEventBySlug);

router.post('/:slug/register', protect, registerToEvent);

export default router;
