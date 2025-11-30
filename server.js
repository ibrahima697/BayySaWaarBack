import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import blogRoutes from './routes/blogs.js';
import contactRoutes from './routes/contacts.js';
import enrollmentRoutes from './routes/enrollments.js';
import dashboardRoutes from './routes/dashboard.js';
import socialRoutes from './routes/social.js';
import adminRoutes from './routes/admin.js';
import errorHandler from './middlewares/errorHandler.js';
import formationRoutes from './routes/formations.js';
import eventRoutes from './routes/event.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ 
  origin: true,  // Accepte tous les domaines (temporaire)
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Augmenter le timeout pour les uploads
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/formations', formationRoutes);
app.use('/api/events', eventRoutes);

app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur MongoDB:', err));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Serveur sur port ${PORT}`));
