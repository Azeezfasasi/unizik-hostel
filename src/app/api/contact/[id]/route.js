import { deleteContact, replyToContact, getContactById, updateContactStatus } from "../../../server/controllers/contactController";
import { authenticate, isAdmin } from "../../../server/middleware/auth.js";

export async function GET(req, context) {
  // Get single contact form (admin only)
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      const params = await context.params;
      return getContactById(req, params.id);
    });
  });
}

export async function DELETE(req, context) {
  // Delete contact form (admin only)
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      const params = await context.params;
      return deleteContact(req, params.id);
    });
  });
}

export async function PUT(req, context) {
  // Reply to contact form or update status (admin only)
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      const params = await context.params;
      const body = await req.clone().json();

      // Prioritize reply over status update (if both are present)
      if (body.message && body.senderId) {
        // It's a reply
        return replyToContact(req, params.id);
      } else if (body.status) {
        // It's a status update
        return updateContactStatus(req, params.id);
      } else {
        return new Response(JSON.stringify({ success: false, message: "Invalid request body" }), { status: 400 });
      }
    });
  });
}
