import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';
import {
  getAllComplaints,
  createComplaint
} from '@/app/server/controllers/complaintController.js';

// GET /api/complaints - Get all complaints (admin only) or user's complaints
export async function GET(req) {
  return authenticate(req, async () => {
    return getAllComplaints(req);
  });
}

// POST /api/complaints - Create new complaint
export async function POST(req) {
  return authenticate(req, async () => {
    return createComplaint(req);
  });
}
