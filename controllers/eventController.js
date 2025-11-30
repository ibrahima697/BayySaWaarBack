// controllers/eventController.js
import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';
import User from '../models/User.js';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @desc    Créer un événement (admin only)
// @route   POST /api/events
export const createEvent = asyncHandler(async (req, res) => {
  const { title, dateStart, dateEnd, ...rest } = req.body;
  const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  const event = await Event.create({
    ...rest,
    title,
    slug,
    dateStart: new Date(req.body.dateStart),
    dateEnd: new Date(req.body.dateEnd),
    createdBy: req.user._id
  });

  res.status(201).json({ event });
});

// @desc    Tous les événements (public)
// @route   GET /api/events
export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({})
    .sort({ dateStart: -1 }) // les plus récents en premier
    .select('-__v')
    .populate('registrations.user', 'firstName lastName email');

  res.json({ events });
});
// @desc    Détail événement + inscriptions visibles pour admin
// @route   GET /api/events/:slug
export const getEventBySlug = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug })
    .populate('registrations.user', 'firstName lastName email phone');

  if (!event) return res.status(404).json({ message: 'Événement non trouvé' });

  res.json({ event });
});

// @desc    Inscription à un événement
// @route   POST /api/events/:slug/register
export const registerToEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug });   
  if (!event) {
    return res.status(404).json({ message: 'Événement non trouvé' });
  }

  // Vérification du user dans la requête
  const userId = req.user?._id || req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }

  // Protection null-safe : reg.user peut être undefined ou un objet populated
  const alreadyRegistered = (event.registrations || []).some((reg) => {
    if (!reg || !reg.user) return false;
    const regUserIdStr = reg.user._id ? reg.user._id.toString() : reg.user.toString();
    return regUserIdStr === userId.toString();
  });

  if (alreadyRegistered) {
    return res.status(400).json({ message: 'Vous êtes déjà inscrit à cet événement' });
  }

  event.registrations.push({ user: userId });
  await event.save();

    // Envoyer un email de confirmation à l'utilisateur
    const user = await User.findById(userId);
    if (user && user.email) {
      const mailOptionsUser = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Confirmation d'inscription à l'événement: ${event.title}`,
        text: `Bonjour ${user.firstName},\n\nVous êtes bien inscrit à l'événement "${event.title}" qui se tiendra du ${event.dateStart.toLocaleDateString()} au ${event.dateEnd.toLocaleDateString()} à ${event.location}.\n\nMerci de votre participation!\n\nCordialement,\nL'équipe Bayy Sa Waar`
      };
      await transporter.sendMail(mailOptionsUser);
    }

    // Envoyer un email de notification à l'admin
    const mailOptionsAdmin = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Nouvelle inscription à l'événement: ${event.title}`,
      text: `L'utilisateur ${user.firstName} ${user.lastName} (${user.email}) s'est inscrit à l'événement "${event.title}".`
    };
    await transporter.sendMail(mailOptionsAdmin);

    res.status(200).json({ message: 'Inscription réussie !' });
});
