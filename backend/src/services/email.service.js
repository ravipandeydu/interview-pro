/**
 * Email Service using Resend
 *
 * This module provides services for sending emails using Resend API.
 *
 * @author Auto-generated
 * @date ${new Date().toISOString().split('T')[0]}
 */

import { Resend } from 'resend';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Initialize Resend client
let resend = null;
if (config.email.resendApiKey) {
  resend = new Resend(config.email.resendApiKey);
} else {
  logger.warn('Resend API key not configured. Email functionality will be disabled.');
}

/**
 * Send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content (optional)
 * @param {string} options.html - HTML content
 * @param {string} options.from - Sender email (optional, uses config default)
 * @returns {Promise<Object>} Resend response object
 */
export const sendEmail = async ({ to, subject, text, html, from }) => {
  try {
    // Check if Resend client is initialized
    if (!resend) {
      logger.warn('Resend client not initialized. Email not sent.');
      return { success: false, message: 'Email service not configured' };
    }

    const emailOptions = {
      from: from || `${config.email.fromName} <${config.email.fromEmail}>`,
      to,
      subject,
      html,
    };

    // Add text content if provided
    if (text) {
      emailOptions.text = text;
    }

    const result = await resend.emails.send(emailOptions);

    logger.info(`Email sent successfully to ${to}`, {
      emailId: result.data?.id,
      subject,
    });

    return {
      success: true,
      data: result.data,
      message: 'Email sent successfully',
    };
  } catch (error) {
    logger.error('Failed to send email:', {
      error: error.message,
      to,
      subject,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send welcome email to new user
 * @param {string} email - User email
 * @param {Object} data - Email data
 * @param {string} data.name - User name
 * @param {string} data.loginUrl - Login URL (optional)
 * @returns {Promise<Object>} Resend response object
 */
const sendWelcome = async (email, data) => {
  const loginUrl = data.loginUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

  return await sendEmail({
    to: email,
    subject: `Welcome to ${config.email.fromName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${config.email.fromName}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${config.email.fromName}!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.name}! 👋</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            We're thrilled to have you join our community! Your account has been successfully created and you're all set to get started.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">What's next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Complete your profile setup</li>
              <li>Explore our features</li>
              <li>Connect with other users</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Get Started</a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions, feel free to reply to this email or contact our support team.
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Best regards,<br>
            The ${config.email.fromName} Team
          </p>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {Object} data - Email data
 * @param {string} data.name - User name
 * @param {string} data.resetURL - Password reset URL
 * @param {number} data.expiresIn - Token expiration time in minutes (optional, default 10)
 * @returns {Promise<Object>} Resend response object
 */
const sendPasswordReset = async (email, data) => {
  const expiresIn = data.expiresIn || 10;

  return await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔒 Password Reset</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.name},</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            We received a request to reset your password. If you made this request, click the button below to reset your password.
          </p>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              ⏰ This link will expire in <strong>${expiresIn} minutes</strong> for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetURL}" style="display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          
          <div style="background: #f8d7da; padding: 15px; border-radius: 6px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #721c24;">
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <p style="font-size: 12px; color: #666; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #007bff;">${data.resetURL}</span>
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Best regards,<br>
            The ${config.email.fromName} Team
          </p>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Send email verification email
 * @param {string} email - User email
 * @param {Object} data - Email data
 * @param {string} data.name - User name
 * @param {string} data.verificationURL - Email verification URL
 * @param {number} data.expiresIn - Token expiration time in hours (optional, default 24)
 * @returns {Promise<Object>} Resend response object
 */
const sendEmailVerification = async (email, data) => {
  const expiresIn = data.expiresIn || 24;

  return await sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✉️ Verify Your Email</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.name},</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for signing up! To complete your registration and secure your account, please verify your email address by clicking the button below.
          </p>
          
          <div style="background: #d1ecf1; padding: 15px; border-radius: 6px; border-left: 4px solid #17a2b8; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #0c5460;">
              ⏰ This verification link will expire in <strong>${expiresIn} hours</strong>.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationURL}" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you didn't create an account with us, please ignore this email.
          </p>
          
          <p style="font-size: 12px; color: #666; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #007bff;">${data.verificationURL}</span>
          </p>
          
          <p style="font-size: 14px; color: #666;">
            Best regards,<br>
            The ${config.email.fromName} Team
          </p>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Send notification email
 * @param {string} email - User email
 * @param {Object} data - Email data
 * @param {string} data.name - User name
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} data.actionUrl - Action URL (optional)
 * @param {string} data.actionText - Action button text (optional)
 * @returns {Promise<Object>} Resend response object
 */
const sendNotification = async (email, data) => {
  const actionButton =
    data.actionUrl && data.actionText
      ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.actionUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">${data.actionText}</a>
    </div>
  `
      : '';

  return await sendEmail({
    to: email,
    subject: data.title,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #007bff 0%, #6610f2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">${data.title}</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <h2 style="color: #333; margin-top: 0;">Hi ${data.name},</h2>
          
          <div style="font-size: 16px; margin-bottom: 20px;">
            ${data.message}
          </div>
          
          ${actionButton}
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Best regards,<br>
            The ${config.email.fromName} Team
          </p>
        </div>
      </body>
      </html>
    `,
  });
};

export default {
  sendEmail,
  sendWelcome,
  sendPasswordReset,
  sendEmailVerification,
  sendNotification,
};
