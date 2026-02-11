import { connectDB } from '@/app/server/db/connect';
import {
  createDonation,
  getAllDonations,
  getDonationStats,
} from '../../server/controllers/donationController';

export async function POST(req) {
  await connectDB();
  return createDonation(req);
}

export async function GET(req) {
  await connectDB();
  
  const { searchParams } = new URL(req.url);
  const isStats = searchParams.get('stats');

  if (isStats === 'true') {
    return getDonationStats();
  }

  return getAllDonations(req);
}
