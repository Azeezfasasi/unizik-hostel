import { connectDB } from '../../../../utils/db';
import { getDonationById, updateDonationStatus, sendReceiptEmail } from '../../../server/controllers/donationController';
import { authenticate, isAdmin } from '@/app/server/middleware/auth.js';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      await connectDB();
      const { id } = await params;
      return getDonationById(id);
    });
  });
}

export async function PATCH(req, { params }) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      await connectDB();
      const { id } = await params;
      const body = await req.json();
      const { action } = body;

      if (action === 'send-receipt') {
        return sendReceiptEmail(id);
      }

      return updateDonationStatus(body, id);
    });
  });
}
