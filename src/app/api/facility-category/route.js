import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';
import {
  getFacilityCategories,
  createFacilityCategory
} from '@/app/server/controllers/facilityController.js';

// GET /api/facility-category - Get all facility categories
export async function GET(req) {
  return authenticate(req, async () => {
    return getFacilityCategories(req);
  });
}

// POST /api/facility-category - Create facility category
export async function POST(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return createFacilityCategory(req);
    });
  });
}
