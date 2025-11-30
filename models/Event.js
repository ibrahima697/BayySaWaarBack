// models/Event.js
import mongoose from 'mongoose';


const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  //email: { type: String, required: true, trim: true, lowercase: true },
  images: [{
    publicId: { type: String },
    url: { type: String },
    alt: { type: String }
  }],
  type: {
    type: String,
    enum: ['seminar', 'business_trip', 'fair', 'conference', 'training', 'networking'],
    default: 'seminar'
  },
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  location: { type: String, required: true },
  priceMember: { type: Number, default: 0 },
  priceNonMember: { type: Number, default: 0 },
  maxParticipants: { type: Number, required: true },
  registrations: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
    paidAt: Date,
    paymentMethod: String,
    registeredAt: { type: Date, default: Date.now }
  }],
  isFeatured: { type: Boolean, default: false }, // pour FIPA 2025
  sponsors: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
