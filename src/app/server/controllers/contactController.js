import Contact from "../models/Contact";
import User from "../models/User";
import { connectDB } from "../db/connect";
import { NextResponse } from "next/server";
import { sendEmail, sendEmailToMultiple } from "../services/emailService";

// 1. Create contact form submission
export const createContact = async (req) => {
  try {
    await connectDB();
    const body = await req.json();
    const contact = new Contact({ ...body });
    await contact.save();

    // Send confirmation email to user
    const userEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #fff; }
          .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
          .message-box { background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>We Received Your Message</h2>
          </div>
          <div class="content">
            <p>Hi ${body.name},</p>
            <p>Thank you for contacting us. We have received your message and will get back to you as soon as possible.</p>
            
            <h3>Your Message Details:</h3>
            <div class="message-box">
              <p><strong>Subject:</strong> ${body.subject}</p>
              <p><strong>Message:</strong></p>
              <p>${body.message}</p>
            </div>
            
            <p>We appreciate your interest and will respond within 24-48 hours.</p>
            <p>Best regards,<br>The CANAN USA Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 CANAN USA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to user
    await sendEmail({
      to: body.email,
      subject: `We Received Your Message - "${body.subject}"`,
      htmlContent: userEmailContent,
      textContent: `Hi ${body.name}, thank you for contacting us. We have received your message about "${body.subject}" and will get back to you soon.`,
      transactionId: `contact-${contact._id}`,
    });

    // Send notification email to all admins
    const admins = await User.find({ role: 'admin' }).select('email firstName lastName');
    
    if (admins.length > 0) {
      const adminEmails = admins.map(admin => admin.email);
      
      const adminEmailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #fff; }
            .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
            .info-box { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .label { font-weight: bold; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <p>A new contact form has been submitted. Please review and respond accordingly.</p>
              
              <div class="info-box">
                <p><span class="label">Name:</span> ${body.name}</p>
                <p><span class="label">Email:</span> ${body.email}</p>
                <p><span class="label">Subject:</span> ${body.subject}</p>
                <p><span class="label">Message:</span></p>
                <p>${body.message.replace(/\n/g, '<br>')}</p>
                <p><span class="label">Contact ID:</span> ${contact._id}</p>
              </div>
              
              <p>Please log in to your dashboard to view and respond to this contact form.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 CANAN USA. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmailToMultiple({
        recipients: adminEmails,
        subject: `New Contact Form Submission - ${body.subject}`,
        htmlContent: adminEmailContent,
        textContent: `New contact form from ${body.name}: "${body.subject}" - ${body.message}`,
      });
    }

    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error) {
    console.error('Contact creation error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

// 2. Get all contact forms (admin only)
export const getAllContacts = async (req) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    let query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(query);

    return NextResponse.json(
      { 
        success: true, 
        data: contacts,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        }
      }, 
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

// 3. Delete contact form
export const deleteContact = async (req, contactId) => {
  try {
    await connectDB();
    const contact = await Contact.findByIdAndDelete(contactId);
    if (!contact) return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Contact deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

// 4. Reply to contact form
export const replyToContact = async (req, contactId) => {
  try {
    await connectDB();
    const body = await req.json();
    const { message, senderId } = body;
    const sender = await User.findById(senderId);
    if (!sender) {
      return NextResponse.json({ success: false, message: "Sender not found" }, { status: 400 });
    }
    const contact = await Contact.findById(contactId);
    if (!contact) return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 });
    
    contact.replies.push({ sender: senderId, senderName: sender.firstName + ' ' + sender.lastName, message });
    contact.status = "replied";
    await contact.save();

    // Send reply notification email to user
    const senderFullName = `${sender.firstName} ${sender.lastName}`;
    const userEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #fff; }
          .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
          .reply-box { background-color: #f0f8ff; padding: 15px; border-left: 4px solid #27ae60; margin: 10px 0; }
          .label { font-weight: bold; color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>We've Replied to Your Message</h2>
          </div>
          <div class="content">
            <p>Hi ${contact.name},</p>
            <p>${senderFullName} from CANAN USA has replied to your contact form regarding "${contact.subject}".</p>
            
            <div class="reply-box">
              <p><span class="label">From:</span> ${senderFullName}</p>
              <p><span class="label">Reply:</span></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>If you have any further questions, please feel free to reach out to us.</p>
            <p>Best regards,<br>The CANAN USA Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 CANAN USA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: contact.email,
      subject: `Reply to Your Message - "${contact.subject}"`,
      htmlContent: userEmailContent,
      textContent: `Hi ${contact.name}, ${senderFullName} has replied to your message: ${message}`,
      replyTo: sender.email,
      transactionId: `contact-reply-${contact._id}`,
    });

    // Send notification to all admins about the reply
    const admins = await User.find({ role: 'admin' }).select('email firstName lastName');
    
    if (admins.length > 0) {
      const adminEmails = admins.map(admin => admin.email);
      
      const adminReplyEmailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3498db; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #fff; }
            .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
            .info-box { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .label { font-weight: bold; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Contact Form Reply Sent</h2>
            </div>
            <div class="content">
              <p>${senderFullName} has replied to a contact form from ${contact.name}.</p>
              
              <div class="info-box">
                <p><span class="label">Contact Name:</span> ${contact.name}</p>
                <p><span class="label">Contact Email:</span> ${contact.email}</p>
                <p><span class="label">Subject:</span> ${contact.subject}</p>
                <p><span class="label">Status:</span> Replied</p>
                <p><span class="label">Replied By:</span> ${senderFullName}</p>
              </div>
              
              <p>Log in to your dashboard to view the full conversation.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 CANAN USA. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmailToMultiple({
        recipients: adminEmails,
        subject: `Contact Form Reply - ${contact.subject}`,
        htmlContent: adminReplyEmailContent,
        textContent: `${senderFullName} has replied to contact from ${contact.name}: ${message}`,
      });
    }

    return NextResponse.json({ success: true, contact }, { status: 200 });
  } catch (error) {
    console.error('Reply error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

// 4.5 Update contact status
export const updateContactStatus = async (req, contactId) => {
  try {
    await connectDB();
    const body = await req.json();
    const { status } = body;
    
    if (!['pending', 'replied', 'closed'].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 });

    const oldStatus = contact.status;
    contact.status = status;
    contact.updatedAt = new Date();
    await contact.save();

    // Send status change email to user
    const statusMessages = {
      pending: 'Your contact form is pending review.',
      replied: 'We have replied to your contact form.',
      closed: 'Your contact form has been closed.',
    };

    const userEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3498db; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #fff; }
          .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
          .status-box { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .label { font-weight: bold; color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Contact Form Status Update</h2>
          </div>
          <div class="content">
            <p>Hi ${contact.name},</p>
            <p>${statusMessages[status]}</p>
            
            <div class="status-box">
              <p><span class="label">Subject:</span> ${contact.subject}</p>
              <p><span class="label">Current Status:</span> <strong>${status.charAt(0).toUpperCase() + status.slice(1)}</strong></p>
              <p><span class="label">Last Updated:</span> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>If you have any questions, please feel free to contact us.</p>
            <p>Best regards,<br>The CANAN USA Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 CANAN USA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: contact.email,
      subject: `Status Update - "${contact.subject}"`,
      htmlContent: userEmailContent,
      textContent: `Hi ${contact.name}, ${statusMessages[status]} Subject: ${contact.subject}`,
      transactionId: `contact-status-${contact._id}`,
    });

    // Send status change notification to all admins
    const admins = await User.find({ role: 'admin' }).select('email firstName lastName');
    
    if (admins.length > 0) {
      const adminEmails = admins.map(admin => admin.email);
      
      const adminStatusEmailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #9b59b6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #fff; }
            .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
            .info-box { background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .label { font-weight: bold; color: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Contact Form Status Changed</h2>
            </div>
            <div class="content">
              <p>A contact form status has been updated.</p>
              
              <div class="info-box">
                <p><span class="label">Contact Name:</span> ${contact.name}</p>
                <p><span class="label">Contact Email:</span> ${contact.email}</p>
                <p><span class="label">Subject:</span> ${contact.subject}</p>
                <p><span class="label">Previous Status:</span> ${oldStatus.charAt(0).toUpperCase() + oldStatus.slice(1)}</p>
                <p><span class="label">New Status:</span> <strong>${status.charAt(0).toUpperCase() + status.slice(1)}</strong></p>
              </div>
              
              <p>Log in to your dashboard to view the full details.</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 CANAN USA. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmailToMultiple({
        recipients: adminEmails,
        subject: `Contact Status Update - ${contact.subject}`,
        htmlContent: adminStatusEmailContent,
        textContent: `Contact form status changed from ${oldStatus} to ${status} for ${contact.name}`,
      });
    }

    return NextResponse.json({ success: true, contact }, { status: 200 });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};

// 5. Get single contact form (admin)
export const getContactById = async (req, contactId) => {
  try {
    await connectDB();
    const contact = await Contact.findById(contactId);
    if (!contact) return NextResponse.json({ success: false, message: "Contact not found" }, { status: 404 });
    return NextResponse.json({ success: true, contact }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
};
