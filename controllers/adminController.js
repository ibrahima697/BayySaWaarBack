import Enrollment from '../models/Enrollment.js';
import Product from '../models/Product.js';
import BlogPost from '../models/BlogPost.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalBlogs = await BlogPost.countDocuments();
    const pendingEnrollments = await Enrollment.countDocuments({ status: 'pending' });
    const approvedEnrollments = await Enrollment.countDocuments({ status: 'approved' });
    const rejectedEnrollments = await Enrollment.countDocuments({ status: 'rejected' });

    const stats = {
      totalUsers,
      totalEnrollments,
      pendingEnrollments,
      approvedEnrollments,
      rejectedEnrollments,
      totalProducts,
      totalBlogs,
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role })
      .select('-password')
      .sort({ createdAt: -1 }); 
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    // Supprimer les enrôlements associés à l'utilisateur (facultatif)
    await Enrollment.deleteMany({ userId: id });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') },
        { phone: new RegExp(query, 'i') },
      ],
    })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const filterUsers = async (req, res, next) => {
  try {
    const { role, companyType, minYears } = req.query;
    const query = {};
    if (role) query.role = role;
    if (companyType) query['companyDetails.type'] = companyType;
    if (minYears) query['companyDetails.years'] = { $gte: Number(minYears) };
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const roles = ['partner', 'member', 'admin'];
    const roleCounts = {};
    for (const role of roles) {
      roleCounts[role] = await User.countDocuments({ role });
    }
    res.json({ totalUsers, roleCounts });
  } catch (err) {
    next(err);
  }
};

export const submitEnrollment = async (req, res, next) => {
  try {
    const { type, firstName, lastName, email, phone, country, city, companyName } = req.body;
    const enrollment = new Enrollment({ type, firstName, lastName, email, phone, country, city, companyName });
    await enrollment.save();

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await sendEmail('iguisse97@gmail.com', `Nouvelle demande d'inscription - ${type}`, 
        `Type: ${type}\nNom: ${firstName} ${lastName}\nEmail: ${email}\nTéléphone: ${phone}\nPays: ${country}\nVille: ${city}\nEntreprise: ${companyName}`);
    }   
    res.status(201).json({ message: 'Demande soumise' });
  } catch (err) {
    next(err);
  }
};

export const getAllEnrollments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    const enrollments = await Enrollment.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    const total = await Enrollment.countDocuments(query);
    res.json({ enrollments, total });
  } catch (err) {
    next(err);
  }
};

export const getEnrollmentById = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Inscription non trouvée' });
    }
    res.json(enrollment);
  } catch (err) {
    next(err);
  }
};

export const updateEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!enrollment) {
      return res.status(404).json({ error: 'Inscription non trouvée' });
    }

    // Si l'enrollment est approuvé et qu'il y a un userId, synchroniser la photo
    if (enrollment.status === 'approved' && enrollment.userId && enrollment.companyLogo?.url) {
      await User.findByIdAndUpdate(enrollment.userId, {
        photo: {
          publicId: enrollment.companyLogo.publicId,
          url: enrollment.companyLogo.url
        }
      });
    }

    res.json({ message: 'Inscription mise à jour', enrollment });
  } catch (err) {
    next(err);
  }
};

export const deleteEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Inscription non trouvée' });
    }
    res.json({ message: 'Inscription supprimée' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

export const getEnrollmentStatus = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id });
    res.json(enrollments);
  } catch (err) {
    next(err);
  }
};
