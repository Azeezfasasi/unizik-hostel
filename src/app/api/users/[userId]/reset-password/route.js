import { authenticate, isAdmin } from "@/app/server/middleware/auth.js";
import { resetUserPassword } from "@/app/server/controllers/authController.js";

// POST /api/users/[userId]/reset-password
export async function POST(req, { params }) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return resetUserPassword(req, params.userId);
    });
  });
}
