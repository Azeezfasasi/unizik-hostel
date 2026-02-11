import axios from 'axios';
import User from '../models/User.js';
import { connectDB } from '../db/connect.js';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME;
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

const brevoClient = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key': BREVO_API_KEY,
    'Content-Type': 'application/json',
  },
});

/**
 * Send email using Brevo
 */
export const sendEmail = async ({
  to,
  subject,
  htmlContent,
  textContent,
  replyTo = BREVO_SENDER_EMAIL,
  transactionId,
}) => {
  try {
    const emailPayload = {
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      htmlContent,
      textContent,
      replyTo: {
        email: replyTo,
        name: BREVO_SENDER_NAME,
      },
    };

    // Add transaction ID as a header for tracking
    if (transactionId) {
      emailPayload.headers = {
        'X-Transaction-ID': transactionId,
      };
    }

    const response = await brevoClient.post('/smtp/email', emailPayload);

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Brevo Email Error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send email to multiple recipients
 */
export const sendEmailToMultiple = async ({
  recipients,
  subject,
  htmlContent,
  textContent,
}) => {
  try {
    const response = await brevoClient.post('/smtp/email', {
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      to: recipients.map(email => ({ email })),
      subject,
      htmlContent,
      textContent,
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Brevo Email Error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send application confirmation email to member
 */
export const sendApplicationConfirmation = async (memberData) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; color: #666; font-size: 12px; }
        .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #1e3a8a; }
        .button { display: inline-block; background-color: #1e3a8a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to CANAN USA</h1>
        </div>
        
        <div class="content">
          <p>Hi ${memberData.firstName} ${memberData.lastName},</p>
          
          <p>Thank you for submitting your membership application to CANAN USA! We are excited about the possibility of having you join our vibrant Nigerian-American Christian community.</p>
          
          <div class="info-box">
            <h3>Application Received</h3>
            <p><strong>Name:</strong> ${memberData.firstName} ${memberData.lastName}</p>
            <p><strong>Email:</strong> ${memberData.email}</p>
            <p><strong>Phone:</strong> ${memberData.phone}</p>
            <p><strong>Location:</strong> ${memberData.city}, ${memberData.state}, ${memberData.country}</p>
            <p><strong>Membership Type:</strong> ${memberData.membershipType.charAt(0).toUpperCase() + memberData.membershipType.slice(1)}</p>
            <p><strong>Volunteer Skills:</strong> ${memberData.specialSkills}</p>
          </div>
          
          <div class="info-box">
            <h3>What Happens Next?</h3>
            <ul>
              <li>Our team will review your application within 2-3 business days</li>
              <li>You will receive a confirmation email with the status of your application</li>
              <li>We may contact you with additional questions</li>
              <li>Once approved, you'll gain access to exclusive community events and resources</li>
            </ul>
          </div>
          
          <p>If you have any questions in the meantime, please don't hesitate to reach out to us at ${BREVO_SENDER_EMAIL}.</p>
          
          <p>Best regards,<br><strong>CANAN USA Team</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2026 CANAN USA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: memberData.email,
    subject: 'CANAN USA - Application Received',
    htmlContent,
  });
};

/**
 * Send status change notification to member
 */
export const sendStatusChangeNotification = async (memberData, newStatus) => {
  const statusLabels = {
    pending: 'Pending Review',
    'under-review': 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  const statusColors = {
    pending: '#FFA500',
    'under-review': '#4F46E5',
    approved: '#10B981',
    rejected: '#EF4444',
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .status-box { 
          background: white; 
          padding: 20px; 
          margin: 20px 0; 
          border-left: 4px solid ${statusColors[newStatus]}; 
          border-radius: 5px;
        }
        .status-badge { 
          display: inline-block; 
          background-color: ${statusColors[newStatus]}; 
          color: white; 
          padding: 10px 15px; 
          border-radius: 5px; 
          font-weight: bold;
        }
        .footer { text-align: center; color: #666; font-size: 12px; }
        .button { display: inline-block; background-color: #1e3a8a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CANAN USA - Application Status Update</h1>
        </div>
        
        <div class="content">
          <p>Hi ${memberData.firstName} ${memberData.lastName},</p>
          
          <div class="status-box">
            <h2>Your Application Status</h2>
            <p style="font-size: 18px; margin: 15px 0;">
              <span class="status-badge">${statusLabels[newStatus]}</span>
            </p>
            ${memberData.adminNotes ? `<p><strong>Notes:</strong> ${memberData.adminNotes}</p>` : ''}
          </div>
          
          <p>Thank you for your continued interest in CANAN USA. If you have any questions about your application or need more information, please contact us at ${BREVO_SENDER_EMAIL}.</p>
          
          <p>Best regards,<br><strong>CANAN USA Team</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2024 CANAN USA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: memberData.email,
    subject: `CANAN USA - Application Status: ${statusLabels[newStatus]}`,
    htmlContent,
  });
};

/**
 * Send admin reply to member
 */
export const sendAdminReply = async (memberData) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .reply-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #1e3a8a; border-radius: 5px; }
        .footer { text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Message from CANAN USA</h1>
        </div>
        
        <div class="content">
          <p>Hi ${memberData.firstName} ${memberData.lastName},</p>
          
          <p>We have a message for you regarding your membership application:</p>
          
          <div class="reply-box">
            <p>${memberData.adminReply}</p>
          </div>
          
          <p>If you have any questions or need further assistance, please don't hesitate to reach out to us at ${BREVO_SENDER_EMAIL}.</p>
          
          <p>Best regards,<br><strong>CANAN USA Team</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2024 CANAN USA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: memberData.email,
    subject: 'CANAN USA - Response to Your Application',
    htmlContent,
  });
};

/**
 * Send admin notification for new application to all admin users
 */
export const sendAdminNotification = async (memberData) => {
  try {
    await connectDB();
    
    // Fetch all admin users
    const admins = await User.find({ role: 'admin' }).select('email firstName lastName');
    
    if (admins.length === 0) {
      console.warn('No admin users found to send notification');
      return { success: false, error: 'No admin users found' };
    }
    
    const adminEmails = admins.map(admin => admin.email);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #1e3a8a; }
        .footer { text-align: center; color: #666; font-size: 12px; }
        .button { display: inline-block; background-color: #1e3a8a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Membership Application</h1>
        </div>
        
        <div class="content">
          <p>A new membership application has been submitted:</p>
          
          <div class="info-box">
            <h3>Personal Information</h3>
            <p><strong>Name:</strong> ${memberData.firstName} ${memberData.lastName}</p>
            <p><strong>Email:</strong> ${memberData.email}</p>
            <p><strong>Phone:</strong> ${memberData.phone}</p>
            <p><strong>Gender:</strong> ${memberData.gender}</p>
          </div>
          
          <div class="info-box">
            <h3>Location</h3>
            <p><strong>Country:</strong> ${memberData.country}</p>
            <p><strong>State/Province:</strong> ${memberData.state}</p>
            <p><strong>City:</strong> ${memberData.city}</p>
            <p><strong>Place of Origin:</strong> ${memberData.placeOfOrigin || 'Not specified'}</p>
          </div>
          
          <div class="info-box">
            <h3>Membership Details</h3>
            <p><strong>Membership Type:</strong> ${memberData.membershipType.charAt(0).toUpperCase() + memberData.membershipType.slice(1)}</p>
            <p><strong>Interests:</strong> ${memberData.interests.join(', ')}</p>
            <p><strong>Skills:</strong> ${memberData.skills || 'Not specified'}</p>
            <p><strong>Special Skills:</strong> ${memberData.specialSkills || 'Not specified'}</p>
          </div>
          
          <div class="info-box">
            <h3>Motivation</h3>
            <p><strong>Why Join:</strong> ${memberData.motivation}</p>
            <p><strong>How They Heard:</strong> ${memberData.howHeardAbout.replace(/_/g, ' ').toUpperCase()}</p>
          </div>
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/membership/${memberData._id}" class="button">View Application</a>
          </p>
        </div>
        
        <div class="footer">
          <p>&copy; 2026 CANAN USA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    return sendEmailToMultiple({
      recipients: adminEmails,
      subject: `New Membership Application - ${memberData.firstName} ${memberData.lastName}`,
      htmlContent,
    });
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send admin notification when application is updated (to all admin users)
 */
export const sendAdminUpdateNotification = async (memberData, updateType) => {
  try {
    await connectDB();
    
    // Fetch all admin users
    const admins = await User.find({ role: 'admin' }).select('email firstName lastName');
    
    if (admins.length === 0) {
      console.warn('No admin users found to send update notification');
      return { success: false, error: 'No admin users found' };
    }
    
    const adminEmails = admins.map(admin => admin.email);
  
  const updateLabels = {
    'status-changed': 'Status Changed',
    'reply-sent': 'Reply Sent',
    'notes-updated': 'Notes Updated',
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 5px; }
        .content { background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #1e3a8a; }
        .footer { text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Updated: ${updateLabels[updateType]}</h1>
        </div>
        
        <div class="content">
          <p>Notification: An application has been updated.</p>
          
          <div class="info-box">
            <h3>Applicant</h3>
            <p><strong>Name:</strong> ${memberData.firstName} ${memberData.lastName}</p>
            <p><strong>Email:</strong> ${memberData.email}</p>
          </div>
          
          ${memberData.status ? `
            <div class="info-box">
              <h3>Current Status</h3>
              <p><strong>Status:</strong> ${memberData.status.charAt(0).toUpperCase() + memberData.status.slice(1)}</p>
            </div>
          ` : ''}
          
          ${memberData.adminNotes ? `
            <div class="info-box">
              <h3>Admin Notes</h3>
              <p>${memberData.adminNotes}</p>
            </div>
          ` : ''}
          
          ${memberData.adminReply ? `
            <div class="info-box">
              <h3>Admin Reply</h3>
              <p>${memberData.adminReply}</p>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>&copy; 2026 CANAN USA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    return sendEmailToMultiple({
      recipients: adminEmails,
      subject: `Application Update: ${memberData.firstName} ${memberData.lastName} - ${updateLabels[updateType]}`,
      htmlContent,
    });
  } catch (error) {
    console.error('Error sending admin update notification:', error);
    return { success: false, error: error.message };
  }
};
