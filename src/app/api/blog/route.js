import { connectDB } from '@/app/server/db/connect';
import { createBlog, getAllBlogs } from '../../server/controllers/blogController';
import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';

export async function POST(req, res) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      await connectDB();
      return createBlog(req, res);
    });
  });
}

export async function GET(req, res) {
  await connectDB();
  return getAllBlogs(req, res);
}
