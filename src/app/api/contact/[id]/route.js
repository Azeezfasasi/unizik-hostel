import { deleteContact, replyToContact, getContactById, updateContactStatus } from "../../../server/controllers/contactController";

export async function GET(req, context) {
  // Get single contact form
  const params = await context.params;
  return getContactById(req, params.id);
}

export async function DELETE(req, context) {
  // Delete contact form
  const params = await context.params;
  return deleteContact(req, params.id);
}

export async function PUT(req, context) {
  // Reply to contact form or update status
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
}
