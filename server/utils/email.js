const { getTransporter } = require('../config/email');

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('⚠️ Email sending is disabled. Transporter not configured.');
    return false;
  }

  try {
    const mailOptions = {
      from: `"Palaro" <${process.env.EMAIL_USER || 'noreply@palaro.ph'}>`,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return false;
  }
};

const sendVerificationEmail = async (user, token) => {
  const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientURL}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D1117; color: #E6EDF3; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F7B731, #E74C3C); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; color: #0D1117;">🎮 Palaro</h1>
        <p style="margin: 8px 0 0; color: #0D1117; opacity: 0.8;">Filipino Childhood Games</p>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #F7B731; margin-top: 0;">Welcome, ${user.username}! 🎉</h2>
        <p>Salamat for joining Palaro! Please verify your email to start playing.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #F7B731, #E74C3C); color: #0D1117; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Verify Email
          </a>
        </div>
        <p style="color: #8B949E; font-size: 14px;">This link expires in 24 hours.</p>
        <p style="color: #8B949E; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
      </div>
      <div style="padding: 20px 30px; background: #161B22; text-align: center; color: #8B949E; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Palaro. Bringing back the fun!</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: '🎮 Welcome to Palaro! Verify your email',
    html,
    text: `Welcome to Palaro, ${user.username}! Verify your email: ${verifyUrl}`,
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientURL}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D1117; color: #E6EDF3; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1A73E8, #27AE60); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; color: white;">🎮 Palaro</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="color: #1A73E8; margin-top: 0;">Password Reset 🔑</h2>
        <p>You requested a password reset for your Palaro account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #1A73E8, #27AE60); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="color: #8B949E; font-size: 14px;">This link expires in 1 hour.</p>
        <p style="color: #8B949E; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div style="padding: 20px 30px; background: #161B22; text-align: center; color: #8B949E; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Palaro. Bringing back the fun!</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: '🔑 Palaro Password Reset',
    html,
    text: `Reset your Palaro password: ${resetUrl}`,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
