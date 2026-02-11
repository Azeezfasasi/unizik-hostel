import { authenticate } from '@/app/server/middleware/auth.js';
import { isAdmin } from '@/app/server/middleware/auth.js';
import {
  updateBlogCategory,
  deleteBlogCategory
} from '@/app/server/controllers/blogCategoryController.js';

// PUT /api/blog-category/[id] - Update blog category
export async function PUT(req, { params }) {
  const { id } = await params;
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return updateBlogCategory(req, id);
    });
  });
}

// DELETE /api/blog-category/[id] - Delete blog category
export async function DELETE(req, { params }) {
  const { id } = await params;
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return deleteBlogCategory(req, id);
    });
  });
}
