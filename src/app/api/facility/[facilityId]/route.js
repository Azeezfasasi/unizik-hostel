import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';
import {
  getFacilityById,
  updateFacility,
  deleteFacility
} from '@/app/server/controllers/facilityController.js';

// GET /api/facility/[facilityId] - Get facility by ID
export async function GET(req, { params }) {
  const { facilityId } = await params;
  return authenticate(req, async () => {
    return getFacilityById(req, facilityId);
  });
}

// PUT /api/facility/[facilityId] - Update facility
export async function PUT(req, { params }) {
  const { facilityId } = await params;
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return updateFacility(req, facilityId);
    });
  });
}

// DELETE /api/facility/[facilityId] - Delete facility
export async function DELETE(req, { params }) {
  const { facilityId } = await params;
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return deleteFacility(req, facilityId);
    });
  });
}
