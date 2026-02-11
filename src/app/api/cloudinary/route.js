import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 */
export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    let fileData, folderName = 'cananusa/gallery';

    if (contentType.includes('application/json')) {
      // Handle legacy JSON requests with base64
      const body = await req.json();
      fileData = body.fileData;
      folderName = body.folderName || folderName;
    } else if (contentType.includes('multipart/form-data')) {
      // Handle FormData requests
      const formData = await req.formData();
      const file = formData.get('file');
      folderName = formData.get('folderName') || folderName;

      if (!file) {
        return Response.json(
          { message: 'File is required' },
          { status: 400 }
        );
      }

      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = file.type || 'application/octet-stream';
      fileData = `data:${mimeType};base64,${base64}`;
    } else {
      return Response.json(
        { message: 'Invalid content type. Use multipart/form-data or application/json' },
        { status: 400 }
      );
    }

    if (!fileData) {
      return Response.json(
        { message: 'File data is required' },
        { status: 400 }
      );
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return Response.json(
        { message: 'Cloudinary is not configured' },
        { status: 500 }
      );
    }

    const uploadOptions = {
      folder: folderName,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    };

    // For videos, add timeout to handle larger uploads
    const result = await cloudinary.uploader.upload(fileData, uploadOptions);

    return Response.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      resourceType: result.resource_type,
      duration: result.duration || undefined,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return Response.json(
      {
        message: 'Failed to upload image to Cloudinary',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Delete image from Cloudinary
 */
export async function DELETE(req) {
  try {
    const { publicId } = await req.json();

    if (!publicId) {
      return Response.json(
        { message: 'Public ID is required' },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);

    return Response.json({
      success: result.result === 'ok',
      message: result.result,
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return Response.json(
      {
        message: 'Failed to delete image from Cloudinary',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
