import { uploadToCloudinary } from '@/app/server/utils/cloudinary.js';

/**
 * POST /api/upload
 * Upload file to Cloudinary
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'cananusa/uploads';

    if (!file) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No file provided'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'File must be an image'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'File size must be less than 5MB'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const secure_url = await uploadToCloudinary(buffer, file.name, folder);

    return new Response(
      JSON.stringify({
        success: true,
        secure_url,
        message: 'Image uploaded successfully'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to upload image'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
