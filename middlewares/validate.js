import { body, validationResult } from 'express-validator';

// Middleware générique pour gérer les erreurs
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Données invalides',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// === 1. Validation pour l'inscription (enrôlement) ===
export const enrollmentValidation = [
  // Champs obligatoires
  body('firstName')
    .notEmpty()
    .withMessage('Prénom requis')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Prénom trop court'),

  body('lastName')
    .notEmpty()
    .withMessage('Nom requis')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Nom trop court'),

  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .bail()
    .normalizeEmail(),

  body('phone')
    .notEmpty()
    .withMessage('Téléphone requis')
    .bail()
    .isMobilePhone('any')
    .withMessage('Numéro de téléphone invalide'),

  body('country')
    .notEmpty()
    .withMessage('Pays requis'),

  body('city')
    .notEmpty()
    .withMessage('Ville requise'),

  // Champs optionnels
  body('companyName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Nom de l’entreprise trop court'),

  body('interests')
    .optional()
    .isArray({ min: 0 })
    .withMessage('Les intérêts doivent être un tableau')
    .bail()
    .custom((arr) => arr.every(i => typeof i === 'string' && i.length > 0))
    .withMessage('Chaque intérêt doit être une chaîne non vide'),

  handleValidationErrors,
];

// === 2. Validation pour l'inscription admin (register) ===
export const registerValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('Prénom requis')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Prénom trop court'),

  body('lastName')
    .notEmpty()
    .withMessage('Nom requis')
    .bail()
    .isLength({ min: 2 })
    .withMessage('Nom trop court'),

  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .bail()
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Mot de passe doit avoir 6+ caractères'),

  body('role')
    .optional()
    .isIn(['admin', 'member'])
    .withMessage('Rôle invalide'),

  body('companyDetails.name')
    .optional()
    .notEmpty()
    .withMessage('Nom de l’entreprise requis si fourni'),

  handleValidationErrors,
];

// === 3. Validation Produits ===
export const productValidation = [
  body('name')
    .notEmpty()
    .withMessage('Nom du produit requis')
    .bail()
    .isLength({ min: 3 })
    .withMessage('Nom trop court'),

  body('description')
    .notEmpty()
    .withMessage('Description requise')
    .bail()
    .isLength({ min: 10 })
    .withMessage('Description trop courte'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Prix invalide'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock invalide'),

  body('category')
    .optional()
    .notEmpty()
    .withMessage('Catégorie requise si fournie'),

  handleValidationErrors,
];

// === 4. Validation Blog ===
export const blogValidation = [
  body('title')
    .notEmpty()
    .withMessage('Titre requis')
    .bail()
    .isLength({ min: 5 })
    .withMessage('Titre trop court'),

  body('content')
    .notEmpty()
    .withMessage('Contenu requis')
    .bail()
    .isLength({ min: 50 })
    .withMessage('Contenu trop court'),

  body('author')
    .notEmpty()
    .withMessage('Auteur requis'),

  body('category')
    .optional()
    .notEmpty()
    .withMessage('Catégorie requise si fournie'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags doivent être un tableau'),

  handleValidationErrors,
];

// === 5. Validation Contact ===
export const contactValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .bail()
    .normalizeEmail(),

  body('message')
    .notEmpty()
    .withMessage('Message requis')
    .bail()
    .isLength({ min: 10 })
    .withMessage('Message trop court'),

  body('category')
    .optional()
    .isIn(['information', 'partnership', 'support', 'formation'])
    .withMessage('Catégorie invalide'),

  handleValidationErrors,
];

export default {
  enrollmentValidation,
  registerValidation,
  productValidation,
  blogValidation,
  contactValidation,
};
