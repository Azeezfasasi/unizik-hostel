import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';
import {
  getFacilities,
  createFacility
} from '@/app/server/controllers/facilityController.js';

// GET /api/facility - Get all facilities
export async function GET(req) {
  return authenticate(req, async () => {
    return getFacilities(req);
  });
}

// POST /api/facility - Create facility
export async function POST(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return createFacility(req);
    });
  });
}
