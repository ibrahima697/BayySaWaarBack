import { createTransport } from 'nodemailer';

const sendEmail = async (to, subject, text) => {
  try {
    // Vérifier que les variables d'environnement sont présentes
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('EMAIL_USER ou EMAIL_PASS manquant dans les variables d\'environnement');
    }

    const transporter = createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Vérifier la connexion
    await transporter.verify();

    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });

    console.log('✅ Email envoyé avec succès:', result.messageId);
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

export default sendEmail;
