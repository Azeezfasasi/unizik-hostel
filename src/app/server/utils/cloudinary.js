import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(buffer, fileName, folder) {
  // buffer: Buffer object
  // fileName: original file name
  // folder: cloudinary folder path
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      max_bytes: 100 * 1024 * 1024, // 100MB limit for large files
    };
    
    // For PDFs, set specific resource type
    if (fileName && fileName.toLowerCase().endsWith('.pdf')) {
      uploadOptions.resource_type = 'raw';
    }
    
    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(buffer);
  });
}