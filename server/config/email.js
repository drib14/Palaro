const nodemailer = require('nodemailer');

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('⚠️ Email credentials not configured. Email sending disabled.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  // Verify connection on startup
  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email transporter verification failed:', error.message);
    } else {
      console.log('✅ Email transporter ready');
    }
  });

  return transporter;
};

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

module.exports = { getTransporter };
