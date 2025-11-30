import Formation from '../models/Formation.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';


// @desc    Get all formations (public + admin)
// @route   GET /api/formations
// @access  Public
// formationController.js
export const getAllFormations = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === 'admin';
  const userId = req.user?._id || req.user?.userId;

  let query = {};
  if (!isAdmin) {
    query = { status: { $in: ['upcoming', 'ongoing'] } };
  }

  const formations = await Formation.find(query)
    .populate('enrolledUsers', 'firstName lastName email')
    .sort({ date: 1 });

  if (isAdmin) {
    // Admin : avec registrations
    const formationsWithRegistrations = await Promise.all(
      formations.map(async (formation) => {
        const populatedRegistrations = await Formation.aggregate([
          { $match: { _id: formation._id } },
          { $unwind: { path: '$registrations', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'users',
              localField: 'registrations.userId',
              foreignField: '_id',
              as: 'registrations.user'
            }
          },
          { $unwind: { path: '$registrations.user', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              'registrations._id': 1,
              'registrations.userId': 1,
              'registrations.status': 1,
              'registrations.registeredAt': 1,
              'registrations.userName': { $concat: ['$registrations.user.firstName', ' ', '$registrations.user.lastName'] },
              'registrations.userEmail': '$registrations.user.email'
            }
          }
        ]);

        const regs = populatedRegistrations.map(p => p.registrations).filter(Boolean);
        return { ...formation.toObject(), registrations: regs };
      })
    );
    res.json({ formations: formationsWithRegistrations });
  } else {
    // PUBLIC / MEMBRE : si connecté → registrations, sinon → []
    const formationsWithMyRegistrations = formations.map(formation => {
      const myRegs = userId
        ? formation.registrations
            .filter(r => r?.userId && r.userId.toString() === userId.toString())
            .map(r => ({
              _id: r._id,
              userId: r.userId,
              status: r.status,
              registeredAt: r.registeredAt
            }))
        : [];
      return { ...formation.toObject(), registrations: myRegs };
    });
    res.json({ formations: formationsWithMyRegistrations });
  }
});

// @desc    Create formation
// @route   POST /api/formations
// @access  Private/Admin
export const createFormation = asyncHandler(async (req, res) => {
  const { title, description, date, location, duration, maxSeats, priceNonMember, category, image } = req.body;

  const formation = await Formation.create({
    title,
    description,
    date: new Date(date), // Convertir string → Date
    location,
    duration,
    maxSeats,
    priceNonMember: priceNonMember || 0,
    category,
    image,
    enrolledUsers: [],
    registrations: [], // Tableau vide
  });

  res.status(201).json(formation);
});

// @desc    Update formation
// @route   PUT /api/formations/:id
// @access  Private/Admin
export const updateFormation = asyncHandler(async (req, res) => {
  const formation = await Formation.findById(req.params.id);
  if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });

  Object.assign(formation, req.body);
  await formation.save();
  res.json(formation);
});

// @desc    Delete formation
// @route   DELETE /api/formations/:id
// @access  Private/Admin
export const deleteFormation = asyncHandler(async (req, res) => {
  const formation = await Formation.findById(req.params.id);
  if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });

  await formation.remove();
  res.json({ message: 'Formation supprimée' });
});

// @desc    Get formation by ID
// @route   GET /api/formations/:id
// @access  Public
export const getFormationById = asyncHandler(async (req, res) => {
  const formation = await Formation.findById(req.params.id)
    .populate('enrolledUsers', 'firstName lastName email');

  if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });

  res.json(formation);
});
// @desc    Register to formation
// @route   POST /api/formations/:id/register
// @access  Private
export const registerToFormation = asyncHandler(async (req, res) => {
  const formation = await Formation.findById(req.params.id);
  if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });

  if (!req.user?._id) {
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }

  const userId = req.user._id;

  const alreadyRegistered = formation.registrations.some(reg => 
    reg.userId?.toString() === userId.toString()
  );

  if (alreadyRegistered) {
    return res.status(400).json({ message: 'Vous êtes déjà inscrit à cette formation' });
  }

  const approvedCount = formation.registrations.filter(r => r.status === 'approved').length;
  if (approvedCount >= formation.maxSeats) {
    return res.status(400).json({ message: 'Plus de places disponibles' });
  }

  formation.registrations.push({
    userId,
    status: 'pending',
    registeredAt: new Date()
  });

  await formation.save();

  res.json({ message: 'Inscription envoyée ! En attente de validation' });
});

// @desc    Update registration status
// @route   PUT /api/formations/:id/registrations/:regId
// @access  Private/Admin
export const updateRegistrationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const formation = await Formation.findById(req.params.id);
  if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });

  // Trouver l'inscription
  const registrationIndex = formation.registrations.findIndex(
    r => r._id.toString() === req.params.regId
  );
  if (registrationIndex === -1) return res.status(404).json({ message: 'Inscription non trouvée' });

  // Mettre à jour le statut
  formation.registrations[registrationIndex].status = status;

  // Si approuvé → ajouter à enrolledUsers
  if (status === 'approved') {
    const userId = formation.registrations[registrationIndex].userId;
    if (!formation.enrolledUsers.includes(userId)) {
      formation.enrolledUsers.push(userId);
    }
  } else if (status === 'rejected') {
    // Optionnel : retirer de enrolledUsers si était approuvé avant
    const userId = formation.registrations[registrationIndex].userId;
    formation.enrolledUsers = formation.enrolledUsers.filter(
      id => id.toObject() !== userId.toObject()
    );
  }

  await formation.save();
  res.json({ message: 'Statut mis à jour' });
});
