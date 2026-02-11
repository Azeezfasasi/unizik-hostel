import { connectDB } from '../../../../utils/db';
import { getDonationById, updateDonationStatus, sendReceiptEmail } from '../../../server/controllers/donationController';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  return getDonationById(id);
}

export async function PATCH(req, { params }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  if (action === 'send-receipt') {
    return sendReceiptEmail(id);
  }

  return updateDonationStatus(body, id);
}
