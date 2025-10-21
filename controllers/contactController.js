import Contact from '../models/Contact.js';
import Newsletter from '../models/Newsletter.js';
import sendEmail from '../utils/sendEmail.js';
import { v4 as uuidv4 } from 'uuid';

export async function submitContact(req, res, next) {
  try {
    const contact = new Contact({ ...req.body, ticketId: uuidv4() });
    await contact.save();
    
    // Envoi d'email de notification à l'admin
    try {
      await sendEmail(
        'admin@baysawaar.com', 
        `Nouveau ticket: ${contact.ticketId}`, 
        `Nouveau message de contact reçu:\n\nTicket ID: ${contact.ticketId}\nNom: ${contact.name}\nEmail: ${contact.email}\nCatégorie: ${contact.category}\nMessage: ${contact.message}\n\nDate: ${new Date().toLocaleString()}`
      );
      console.log('✅ Email de notification envoyé à l\'admin');
    } catch (emailError) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email de notification:', emailError);
      // On continue même si l'email échoue, le message est déjà sauvegardé
    }
    
    res.status(201).json({ message: 'Message soumis', ticketId: contact.ticketId });
  } catch (err) {
    next(err);
  }
}

export async function subscribeNewsletter(req, res, next) {
  try {
    console.log('🔍 subscribeNewsletter called with email:', req.body.email);
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      console.log('⚠️ Email déjà abonné:', email);
      return res.status(409).json({ error: 'Déjà abonné' });
    }
    
    console.log('💾 Sauvegarde de l\'abonnement...');
    const subscription = new Newsletter({ email });
    await subscription.save();
    console.log('✅ Abonnement sauvegardé');
    
    // Envoi d'email de confirmation
    try {
      console.log('📧 Envoi de l\'email de confirmation...');
      await sendEmail(
        email, 
        'Bienvenue à la newsletter BAY SA WAAR', 
        `Bonjour,\n\nMerci de vous être abonné à notre newsletter ! Vous recevrez désormais nos dernières actualités et offres spéciales.\n\nCordialement,\nL'équipe BAY SA WAAR`
      );
      console.log('✅ Email de confirmation envoyé');
    } catch (emailError) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
      // On continue même si l'email échoue, l'abonnement est déjà sauvegardé
    }
    
    res.status(201).json({ message: 'Abonnement réussi' });
  } catch (err) {
    console.error('❌ Erreur dans subscribeNewsletter:', err);
    next(err);
  }
}

export async function getAllContacts(req, res, next) {
  if (req.userRole !== 'admin') throw new Error('Accès interdit');
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    next(err);
  }
}

export async function updateContactStatus(req, res, next) {
  if (req.userRole !== 'admin') throw new Error('Accès interdit');
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!contact) throw new Error('Message non trouvé');
    res.json(contact);
  } catch (err) {
    next(err);
  }
}
