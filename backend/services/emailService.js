const nodemailer = require('nodemailer');

/**
 * Create a transporter for sending emails
 * In production, you would use a real email service
 * For development, we can use a test account from Ethereal
 */
const createTransporter = async () => {
  // For production
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  // For development (using Ethereal)
  const testAccount = await nodemailer.createTestAccount();
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text content
 * @param {String} options.html - HTML content
 * @returns {Object} Info about the sent email
 */
const sendEmail = async (options) => {
  const transporter = await createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'QuickNotes <noreply@quicknotes.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };
  
  const info = await transporter.sendMail(mailOptions);
  
  // Log the test URL in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};

/**
 * Send a verification email
 * @param {Object} user - User object
 * @param {String} verificationToken - Verification token
 */
const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const subject = 'Verify your email address';
  
  const text = `
    Hello ${user.username},
    
    Please verify your email address by clicking on the link below:
    
    ${verificationUrl}
    
    If you did not create an account, please ignore this email.
    
    Thanks,
    The QuickNotes Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify your email address</h2>
      <p>Hello ${user.username},</p>
      <p>Please verify your email address by clicking on the button below:</p>
      <p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>If you did not create an account, please ignore this email.</p>
      <p>Thanks,<br>The QuickNotes Team</p>
    </div>
  `;
  
  await sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
};

/**
 * Send a password reset email
 * @param {Object} user - User object
 * @param {String} resetToken - Reset token
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const subject = 'Reset your password';
  
  const text = `
    Hello ${user.username},
    
    You are receiving this email because you (or someone else) has requested to reset your password.
    
    Please click on the link below to reset your password:
    
    ${resetUrl}
    
    If you did not request this, please ignore this email and your password will remain unchanged.
    
    Thanks,
    The QuickNotes Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>Hello ${user.username},</p>
      <p>You are receiving this email because you (or someone else) has requested to reset your password.</p>
      <p>Please click on the button below to reset your password:</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>Thanks,<br>The QuickNotes Team</p>
    </div>
  `;
  
  await sendEmail({
    to: user.email,
    subject,
    text,
    html
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
};
