const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransporter = () => {
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // Default to SMTP (for development or other providers)
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const transporter = createTransporter();

// Send verification email
const sendVerificationEmail = async (email, firstName, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'Welcome to ZapPay - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚡ ZapPay</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Lightning Fast Payments</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Welcome ${firstName}!</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for joining ZapPay! To complete your registration and start making lightning-fast payments, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #f59e0b;">${verificationUrl}</a>
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            This email was sent by ZapPay. If you didn't create an account, please ignore this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: 'ZapPay - Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚡ ZapPay</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Lightning Fast Payments</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Password Reset Request</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${firstName},<br><br>
            We received a request to reset your ZapPay password. Click the button below to create a new password.
            This link will expire in 1 hour for security reasons.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #f59e0b;">${resetUrl}</a>
          </p>
          
          <p style="color: #ef4444; font-size: 14px; margin: 20px 0 0 0;">
            If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            This email was sent by ZapPay for security purposes.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send transaction notification email
const sendTransactionNotification = async (email, firstName, transaction) => {
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: `ZapPay - ${transaction.type === 'send' ? 'Payment Sent' : 'Payment Received'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚡ ZapPay</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Lightning Fast Payments</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">
            ${transaction.type === 'send' ? 'Payment Sent Successfully' : 'Payment Received'}
          </h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #6b7280;">Amount:</p>
            <p style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold; color: #1f2937;">
              $${transaction.amount.toFixed(2)}
            </p>
            
            <p style="margin: 0 0 10px 0; color: #6b7280;">${transaction.type === 'send' ? 'To:' : 'From:'}</p>
            <p style="margin: 0 0 20px 0; color: #1f2937;">${transaction.recipient || transaction.sender}</p>
            
            ${transaction.note ? `
              <p style="margin: 0 0 10px 0; color: #6b7280;">Note:</p>
              <p style="margin: 0 0 20px 0; color: #1f2937;">${transaction.note}</p>
            ` : ''}
            
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              ${new Date(transaction.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0; font-size: 14px;">
            This notification was sent by ZapPay. If you have any concerns, please contact support.
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Transaction notification sent to ${email}`);
  } catch (error) {
    console.error('Error sending transaction notification:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTransactionNotification
};
