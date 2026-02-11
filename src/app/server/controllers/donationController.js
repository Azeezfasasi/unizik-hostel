import Donation from '../models/Donation';
import User from '../models/User';
import BankDetails from '../models/BankDetails';
import { NextResponse } from 'next/server';
import { sendEmail } from '../services/emailService';

// Create a new donation
export async function createDonation(req) {
  try {
    const body = await req.json();
    
    const {
      donorName,
      donorEmail,
      donorPhone,
      donorMessage,
      amount,
      currency,
      donationType,
      paymentMethod,
      referenceNumber,
    } = body;

    // Validate required fields
    if (!donorName || !donorEmail || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transaction ID
    const transactionId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const donation = new Donation({
      donorName,
      donorEmail,
      donorPhone,
      donorMessage,
      amount,
      currency,
      donationType,
      paymentMethod,
      transactionId,
      referenceNumber,
    });

    await donation.save();

    // Fetch bank details for payment instructions
    let bankDetails = null;
    try {
      bankDetails = await BankDetails.findOne({ isActive: true });
    } catch (bankError) {
      console.error('Error fetching bank details:', bankError);
    }

    // Send confirmation email to donor
    try {
      const bankDetailsHTML = bankDetails ? `
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #92400e;">Payment Instructions</h3>
          <p><strong>Bank Name:</strong> ${bankDetails.bankName}</p>
          <p><strong>Account Name:</strong> ${bankDetails.accountName}</p>
          <p><strong>Account Number:</strong> ${bankDetails.accountNumber}</p>
          ${bankDetails.routingNumber ? `<p><strong>Routing Number:</strong> ${bankDetails.routingNumber}</p>` : ''}
          ${bankDetails.swiftCode ? `<p><strong>SWIFT Code:</strong> ${bankDetails.swiftCode}</p>` : ''}
          ${bankDetails.ibanCode ? `<p><strong>IBAN Code:</strong> ${bankDetails.ibanCode}</p>` : ''}
          ${bankDetails.address ? `<p><strong>Bank Address:</strong> ${bankDetails.address}</p>` : ''}
          ${bankDetails.phone ? `<p><strong>Bank Phone:</strong> ${bankDetails.phone}</p>` : ''}
          ${bankDetails.email ? `<p><strong>Bank Email:</strong> ${bankDetails.email}</p>` : ''}
          ${bankDetails.currency ? `<p><strong>Currency:</strong> ${bankDetails.currency}</p>` : ''}
        </div>
      ` : '';

      await sendEmail({
        to: donorEmail,
        subject: `Donation Confirmation - UNIZIK Hostel | ${donation.transactionId}`,
        transactionId,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Donation Received</h2>
            <p>Dear ${donorName},</p>
            <p>Thank you for your generous donation to UNIZIK Hostel. Your contribution means a lot to us.</p>
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Amount:</strong> ${currency} ${amount}</p>
              <p><strong>Type:</strong> ${donationType}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            ${bankDetailsHTML}
            <p>A receipt will be sent to you once your donation has been confirmed by our team.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>God bless you!</p>
            <p>UNIZIK Hostel Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the donation creation if email fails
    }

    // Send notification email to all admins
    try {
      const admins = await User.find({ role: 'admin', isActive: true });
      
      if (admins.length > 0) {
        // Send individual emails to each admin
        const adminEmailPromises = admins.map(admin =>
          sendEmail({
            to: admin.email,
            subject: `New Donation Submitted - UNIZIK Hostel | ${transactionId}`,
            transactionId,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">New Donation Submission</h2>
                <p>Dear ${admin.firstName},</p>
                <p>A new donation has been submitted and requires your attention.</p>
                <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Donor Information</h3>
                  <p><strong>Name:</strong> ${donorName}</p>
                  <p><strong>Email:</strong> ${donorEmail}</p>
                  ${donorPhone ? `<p><strong>Phone:</strong> ${donorPhone}</p>` : ''}
                  <h3 style="margin-top: 20px;">Donation Details</h3>
                  <p><strong>Transaction ID:</strong> ${transactionId}</p>
                  <p><strong>Amount:</strong> ${currency} ${amount}</p>
                  <p><strong>Type:</strong> ${donationType}</p>
                  <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                  <p><strong>Status:</strong> Pending Review</p>
                  ${donorMessage ? `<p><strong>Donor Message:</strong> ${donorMessage}</p>` : ''}
                </div>
                <p style="color: #666; font-size: 14px;">Please log in to the admin panel to review and update the donation status.</p>
                <p>UNIZIK Hostel Team</p>
              </div>
            `,
          })
        );
        
        await Promise.all(adminEmailPromises);
      }
    } catch (adminEmailError) {
      console.error('Admin notification email error:', adminEmailError);
      // Don't fail the donation creation if admin notification fails
    }

    return NextResponse.json(
      {
        message: 'Donation received successfully',
        donation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Donation creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating donation' },
      { status: 500 }
    );
  }
}

// Get all donations (admin only)
export async function getAllDonations(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const donationType = searchParams.get('donationType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = {};

    if (status) query.status = status;
    if (donationType) query.donationType = donationType;

    const skip = (page - 1) * limit;

    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('processedBy', 'firstName lastName email');

    const total = await Donation.countDocuments(query);

    return NextResponse.json(
      {
        donations,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get donations error:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching donations' },
      { status: 500 }
    );
  }
}

// Get donation by ID
export async function getDonationById(id) {
  try {
    const donation = await Donation.findById(id).populate(
      'processedBy',
      'firstName lastName email'
    );

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(donation, { status: 200 });
  } catch (error) {
    console.error('Get donation error:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching donation' },
      { status: 500 }
    );
  }
}

// Update donation status
export async function updateDonationStatus(body, donationId) {
  try {
    const { status, notes } = body;

    const donation = await Donation.findByIdAndUpdate(
      donationId,
      {
        status,
        notes,
        processedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('processedBy', 'firstName lastName email');

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    // Send status update email to donor
    try {
      const statusMessage = {
        pending: 'Your donation is currently pending review.',
        confirmed: 'Your donation has been confirmed. Thank you for your generous contribution!',
        cancelled: 'Your donation has been cancelled. Please contact us if you have any questions.',
      };

      await sendEmail({
        to: donation.donorEmail,
        subject: `Donation Status Update - UNIZIK Hostel | ${donation.transactionId}`,
        transactionId: donation.transactionId,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Donation Status Update</h2>
            <p>Dear ${donation.donorName},</p>
            <p>${statusMessage[status] || 'Your donation status has been updated.'}</p>
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Donation Details</h3>
              <p><strong>Transaction ID:</strong> ${donation.transactionId}</p>
              <p><strong>Amount:</strong> ${donation.currency} ${donation.amount}</p>
              <p><strong>Donation Type:</strong> ${donation.donationType}</p>
              <p><strong>Status:</strong> <span style="font-weight: bold; color: ${status === 'confirmed' ? '#16a34a' : status === 'cancelled' ? '#dc2626' : '#f59e0b'};">${status.charAt(0).toUpperCase() + status.slice(1)}</span></p>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            <p>If you have any questions, please contact us at your earliest convenience.</p>
            <p>God bless you!</p>
            <p><strong>UNIZIK Hostel Team</strong></p>
          </div>
        `,
      });
    } catch (donorEmailError) {
      console.error('Donor notification email error:', donorEmailError);
      // Don't fail the status update if email fails
    }

    // Send status update notification to all admins
    try {
      const admins = await User.find({ role: 'admin', isActive: true });
      
      if (admins.length > 0) {
        // Send individual emails to each admin
        const adminEmailPromises = admins.map(admin =>
          sendEmail({
            to: admin.email,
            subject: `Donation Status Updated - UNIZIK Hostel | ${donation.transactionId}`,
            transactionId: donation.transactionId,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Donation Status Update Notification</h2>
                <p>Dear ${admin.firstName},</p>
                <p>A donation status has been updated. Please see the details below.</p>
                <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Donation Details</h3>
                  <p><strong>Donor:</strong> ${donation.donorName}</p>
                  <p><strong>Email:</strong> ${donation.donorEmail}</p>
                  <p><strong>Transaction ID:</strong> ${donation.transactionId}</p>
                  <p><strong>Amount:</strong> ${donation.currency} ${donation.amount}</p>
                  <p><strong>New Status:</strong> <span style="font-weight: bold; color: ${status === 'confirmed' ? '#16a34a' : status === 'cancelled' ? '#dc2626' : '#f59e0b'};">${status.charAt(0).toUpperCase() + status.slice(1)}</span></p>
                  ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                  <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <p>UNIZIK Hostel Team</p>
              </div>
            `,
          })
        );
        
        await Promise.all(adminEmailPromises);
      }
    } catch (adminEmailError) {
      console.error('Admin notification email error:', adminEmailError);
      // Don't fail the status update if email fails
    }

    return NextResponse.json(donation, { status: 200 });
  } catch (error) {
    console.error('Update donation error:', error);
    return NextResponse.json(
      { error: error.message || 'Error updating donation' },
      { status: 500 }
    );
  }
}

// Send receipt email
export async function sendReceiptEmail(donationId) {
  try {
    const donation = await Donation.findById(donationId);

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    const receiptNumber = `RECEIPT-${donation._id.toString().slice(-8).toUpperCase()}`;

    await sendEmail({
      to: donation.donorEmail,
      subject: `Donation Receipt #${receiptNumber} - UNIZIK Hostel`,
      transactionId: donation.transactionId,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Official Donation Receipt</h2>
          <p>Dear ${donation.donorName},</p>
          <p>Thank you for your generous donation to UNIZIK Hostel.</p>
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Donation Details</h3>
            <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
            <p><strong>Transaction ID:</strong> ${donation.transactionId}</p>
            <p><strong>Amount:</strong> ${donation.currency} ${donation.amount}</p>
            <p><strong>Donation Type:</strong> ${donation.donationType}</p>
            <p><strong>Date:</strong> ${new Date(donation.createdAt).toLocaleDateString()}</p>
          </div>
          <p>This receipt is for your tax records. UNIZIK Hostel is a registered non-profit organization.</p>
          <p>Your generous support enables us to continue our mission of serving the community.</p>
          <p>God bless you!</p>
          <p><strong>UNIZIK Hostel Team</strong></p>
        </div>
      `,
    });

    // Update donation record
    donation.receiptSent = true;
    donation.receiptSentAt = new Date();
    await donation.save();

    return NextResponse.json(
      { message: 'Receipt email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send receipt error:', error);
    return NextResponse.json(
      { error: error.message || 'Error sending receipt' },
      { status: 500 }
    );
  }
}

// Get donation statistics
export async function getDonationStats() {
  try {
    const stats = await Donation.aggregate([
      {
        $facet: {
          totalDonations: [
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ],
          byType: [
            { $match: { status: 'confirmed' } },
            { $group: { _id: '$donationType', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ],
          byCurrency: [
            { $match: { status: 'confirmed' } },
            { $group: { _id: '$currency', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          ],
          monthlyTrend: [
            { $match: { status: 'confirmed' } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: -1 } },
            { $limit: 12 },
          ],
        },
      },
    ]);

    return NextResponse.json(stats[0], { status: 200 });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching statistics' },
      { status: 500 }
    );
  }
}
