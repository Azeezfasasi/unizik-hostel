import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';
import {
  getBlogCategories,
  createBlogCategory
} from '@/app/server/controllers/blogCategoryController.js';

// GET /api/blog-category - Get all blog categories
export async function GET(req) {
  return getBlogCategories(req);
}

// POST /api/blog-category - Create blog category
export async function POST(req) {
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return createBlogCategory(req);
    });
  });
}
