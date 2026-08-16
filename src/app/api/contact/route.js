import { createContact, getAllContacts } from "../../server/controllers/contactController";
import { authenticate, isAdmin } from "../../server/middleware/auth.js";

export async function GET(req) {
  // List all contact forms (admin only)
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return getAllContacts(req);
    });
  });
}

export async function POST(req) {
  // Create a new contact form submission
  return createContact(req);
}
