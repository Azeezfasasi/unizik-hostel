// Use relative paths for API calls - works on any domain
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return '';
  }
  // Server-side fallback
  return process.env.NEXT_PUBLIC_APP_URL || '';
};

const API_BASE = getApiBase();

/**
 * Upload image/video to Cloudinary via API
 * Accepts either a File object or base64 data string
 */
export const uploadImageToCloudinary = async (fileDataOrFile, folderName = 'cananusa/gallery') => {
  try {
    if (!fileDataOrFile) {
      throw new Error('File data is required');
    }

    let formData = new FormData();
    
    // Check if it's a File object or a base64 string
    if (fileDataOrFile instanceof File) {
      // Use the file directly
      formData.append('file', fileDataOrFile);
    } else if (typeof fileDataOrFile === 'string' && fileDataOrFile.startsWith('data:')) {
      // Convert base64 data URL to File object
      const [header, data] = fileDataOrFile.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
      const binary = atob(data);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      const blob = new Blob([new Uint8Array(array)], { type: mimeType });
      formData.append('file', blob);
    } else {
      throw new Error('Invalid file format. Provide a File object or base64 data URL');
    }
    
    formData.append('folderName', folderName);

    const response = await fetch(`${API_BASE}/api/cloudinary`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header; the browser will set it with the boundary
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary via API
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const response = await fetch(`${API_BASE}/api/cloudinary`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Fetch all galleries with filters
 */
export const fetchGalleries = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.featured) params.append('featured', filters.featured);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const response = await fetch(`${API_BASE}/api/gallery?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch galleries');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
};

/**
 * Fetch single gallery by ID
 */
export const fetchGallery = async (id) => {
  try {
    if (!id) {
      throw new Error('Gallery ID is required');
    }

    const response = await fetch(`${API_BASE}/api/gallery/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch gallery');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching gallery:', error);
    throw error;
  }
};

/**
 * Create new gallery
 */
export const createGallery = async (galleryData) => {
  try {
    if (!galleryData.title) {
      throw new Error('Title is required');
    }

    if (!galleryData.media || galleryData.media.length === 0) {
      throw new Error('At least one image or video is required');
    }

    const response = await fetch(`${API_BASE}/api/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(galleryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create gallery');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating gallery:', error);
    throw error;
  }
};

/**
 * Update gallery
 */
export const updateGallery = async (id, galleryData) => {
  try {
    if (!id) {
      throw new Error('Gallery ID is required');
    }

    const response = await fetch(`${API_BASE}/api/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(galleryData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update gallery');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating gallery:', error);
    throw error;
  }
};

/**
 * Delete gallery
 */
export const deleteGallery = async (id) => {
  try {
    if (!id) {
      throw new Error('Gallery ID is required');
    }

    const response = await fetch(`${API_BASE}/api/gallery/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete gallery');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting gallery:', error);
    throw error;
  }
};

/**
 * Reorder images in gallery
 */
export const reorderGalleryImages = async (id, imageOrder) => {
  try {
    if (!id) {
      throw new Error('Gallery ID is required');
    }

    if (!Array.isArray(imageOrder)) {
      throw new Error('imageOrder must be an array');
    }

    const response = await fetch(`${API_BASE}/api/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageOrder }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reorder images');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reordering images:', error);
    throw error;
  }
};

/**
 * Delete image from gallery
 */
export const deleteGalleryImage = async (id, publicId) => {
  try {
    if (!id || !publicId) {
      throw new Error('Gallery ID and publicId are required');
    }

    const response = await fetch(`${API_BASE}/api/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'deleteImage',
        publicId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Add images to gallery
 */
export const addGalleryImages = async (id, images) => {
  try {
    if (!id) {
      throw new Error('Gallery ID is required');
    }

    if (!Array.isArray(images) || images.length === 0) {
      throw new Error('Images array is required');
    }

    const response = await fetch(`${API_BASE}/api/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'addImages',
        images,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add images');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding images:', error);
    throw error;
  }
};

const galleryApi = {
  fetchGalleries,
  fetchGallery,
  createGallery,
  updateGallery,
  deleteGallery,
  reorderGalleryImages,
  deleteGalleryImage,
  addGalleryImages,
};

export default galleryApi;
