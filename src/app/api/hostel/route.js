import { getHostels, createHostel } from '@/app/server/controllers/hostelController.js';
import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';

// GET /api/hostel - Get all hostels
export async function GET(req) {
  return getHostels(req);
}

// POST /api/hostel - Create new hostel
export async function POST(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return createHostel(req);
    });
  });
}
