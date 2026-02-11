import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';
import {
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  addFeedback
} from '@/app/server/controllers/complaintController.js';

// GET /api/complaints/[id] - Get single complaint
export async function GET(req, { params }) {
  const { id } = await params;
  return authenticate(req, async () => {
    return getComplaintById(req, id);
  });
}

// PUT /api/complaints/[id] - Update complaint (admin only)
export async function PUT(req, { params }) {
  const { id } = await params;
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return updateComplaint(req, id);
    });
  });
}

// DELETE /api/complaints/[id] - Delete complaint (admin only)
export async function DELETE(req, { params }) {
  const { id } = await params;
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return deleteComplaint(req, id);
    });
  });
}

// POST /api/complaints/[id]/feedback - Add feedback (user only)
export async function POST(req, { params }) {
  const { id } = await params;
  return authenticate(req, async () => {
    return addFeedback(req, id);
  });
}
