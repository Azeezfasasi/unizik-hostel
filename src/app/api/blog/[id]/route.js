import { connectDB } from '../../../../utils/db';
import { getBlogById, updateBlog, deleteBlog, changeBlogStatus } from '../../../server/controllers/blogController';
import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';

export async function GET(req, context) {
  await connectDB();
  return getBlogById(req, context);
}

export async function PUT(req, context) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      await connectDB();
      return updateBlog(req, context);
    });
  });
}

export async function DELETE(req, context) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      await connectDB();
      return deleteBlog(req, context);
    });
  });
}

export async function PATCH(req, context) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      await connectDB();
      return changeBlogStatus(req, context);
    });
  });
}
