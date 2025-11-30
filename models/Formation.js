import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

const formationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  duration: { type: String, required: true },
  maxSeats: { type: Number, required: true, min: 1 },
  enrolledUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  registrations: [registrationSchema],
  priceNonMember: { type: Number, default: 0 },
  image: { type: String },
  category: {
    type: String,
    enum: ['transformation-cereales', 'fruits-legumes', 'entrepreneuriat', 'autonomisation-femmes', 'formalisation'],
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, { timestamps: true });

formationSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Formation || mongoose.model('Formation', formationSchema);
