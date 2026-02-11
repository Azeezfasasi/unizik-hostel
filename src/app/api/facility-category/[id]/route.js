import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';
import {
  updateFacilityCategory,
  deleteFacilityCategory
} from '@/app/server/controllers/facilityController.js';

// PUT /api/facility-category/[id] - Update facility category
export async function PUT(req, { params }) {
  const { id } = await params;
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return updateFacilityCategory(req, id);
    });
  });
}

// DELETE /api/facility-category/[id] - Delete facility category
export async function DELETE(req, { params }) {
  const { id } = await params;
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return deleteFacilityCategory(req, id);
    });
  });
}
