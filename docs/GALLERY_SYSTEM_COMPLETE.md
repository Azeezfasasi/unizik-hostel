# Gallery System Documentation

## Overview

The gallery system is a complete media management solution integrated with Cloudinary for image hosting and Next.js for the backend and frontend.

## Features

1. **Add Gallery** - Create new galleries with multiple images
2. **Edit Gallery** - Modify gallery details and images
3. **Delete Gallery** - Remove galleries and associated images from Cloudinary
4. **View Gallery** - Display gallery details with all images
5. **List/Filter** - Browse galleries with filtering and pagination
6. **Cloudinary Integration** - Automatic image upload/deletion with public ID tracking

## File Structure

### Backend

#### Models
- **`src/app/server/models/Gallery.js`**
  - Mongoose schema for gallery items
  - Fields: title, description, category, images, featured, status, businessName, location, tags, views, timestamps
  - Images stored as array with url, publicId, alt, displayOrder
  - Database indexes for category/status and featured/status queries
  - Virtual imageCount property

#### Controllers
- **`src/app/server/controllers/galleryController.js`**
  - `createGallery()` - Create new gallery
  - `getGallery()` - Fetch single gallery with view tracking
  - `getAllGalleries()` - List galleries with filtering, search, pagination
  - `updateGallery()` - Update gallery details and images
  - `deleteGallery()` - Remove gallery and Cloudinary images
  - `reorderImages()` - Change image display order
  - `deleteImage()` - Remove single image from gallery
  - `addImagesToGallery()` - Add images to existing gallery

#### Utilities
- **`src/app/server/utils/cloudinaryService.js`**
  - `uploadToCloudinary()` - Upload image to Cloudinary with folder organization
  - `deleteFromCloudinary()` - Delete image by public ID
  - `deleteMultipleFromCloudinary()` - Batch delete images
  - `optimizeImageUrl()` - Generate optimized image URLs for different sizes

#### API Routes
- **`src/app/api/gallery/route.js`**
  - `GET` - List galleries with filters
  - `POST` - Create new gallery

- **`src/app/api/gallery/[id]/route.js`**
  - `GET` - Retrieve single gallery (increments view count)
  - `PUT` - Update gallery or perform image operations
  - `DELETE` - Delete gallery and all images

### Frontend

#### API Utilities
- **`src/app/utils/galleryApi.js`**
  - `fetchGalleries()` - Get list of galleries
  - `fetchGallery()` - Get single gallery
  - `createGallery()` - Create new gallery
  - `updateGallery()` - Update gallery
  - `deleteGallery()` - Delete gallery
  - `reorderGalleryImages()` - Reorder images
  - `deleteGalleryImage()` - Delete single image
  - `addGalleryImages()` - Add images to gallery

#### Pages
- **`src/app/admin/gallery/add-gallery/page.jsx`**
  - Form for creating new gallery
  - Image upload with Cloudinary integration
  - Category, status, tags, business info fields
  - Real-time image preview
  - Success/error messages

- **`src/app/admin/gallery/all-gallery/page.jsx`**
  - Gallery listing with pagination
  - Search and filtering (category, status)
  - Quick actions (View, Edit, Delete)
  - Gallery cards with image preview
  - View count and creation date display

## API Endpoints

### List Galleries
```
GET /api/gallery?category=accommodation&status=active&page=1&limit=10&search=term&sortBy=-createdAt
```

Response:
```json
{
  "galleries": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Get Single Gallery
```
GET /api/gallery/[id]
```

Response:
```json
{
  "_id": "...",
  "title": "...",
  "images": [
    {
      "url": "https://...",
      "publicId": "...",
      "alt": "...",
      "displayOrder": 0
    }
  ],
  "views": 25,
  ...
}
```

### Create Gallery
```
POST /api/gallery
Body: {
  "title": "string",
  "description": "string",
  "category": "accommodation|restaurant|beauty|event|mobility|other",
  "images": [
    {
      "url": "string",
      "publicId": "string",
      "alt": "string",
      "displayOrder": number
    }
  ],
  "featured": boolean,
  "status": "active|inactive",
  "businessName": "string",
  "location": "string",
  "tags": ["string"]
}
```

### Update Gallery
```
PUT /api/gallery/[id]
Body: {
  "title": "string",
  "description": "string",
  "category": "string",
  "featured": boolean,
  "status": "string",
  "businessName": "string",
  "location": "string",
  "tags": ["string"],
  "images": [...]  // Optional: to replace all images
}
```

### Reorder Images
```
PUT /api/gallery/[id]
Body: {
  "imageOrder": ["publicId1", "publicId2", "publicId3"]
}
```

### Delete Single Image
```
PUT /api/gallery/[id]
Body: {
  "operation": "deleteImage",
  "publicId": "string"
}
```

### Add Images
```
PUT /api/gallery/[id]
Body: {
  "operation": "addImages",
  "images": [
    {
      "url": "string",
      "publicId": "string",
      "alt": "string"
    }
  ]
}
```

### Delete Gallery
```
DELETE /api/gallery/[id]
```

## Database Schema

```javascript
Gallery {
  _id: ObjectId,
  title: String (required),
  description: String,
  category: String (enum: accommodation, restaurant, beauty, event, mobility, other),
  images: [
    {
      url: String,
      publicId: String,
      alt: String,
      displayOrder: Number
    }
  ],
  featured: Boolean,
  status: String (enum: active, inactive),
  businessName: String,
  location: String,
  createdBy: ObjectId (optional),
  views: Number,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## Usage Examples

### Create Gallery with Images

```javascript
import { uploadToCloudinary } from '@/app/server/utils/cloudinaryService';
import { createGallery } from '@/app/utils/galleryApi';

// Upload images to Cloudinary
const img1 = await uploadToCloudinary(fileData, 'rayob/gallery');
const img2 = await uploadToCloudinary(fileData2, 'rayob/gallery');

// Create gallery
const gallery = await createGallery({
  title: 'Beach Resort',
  description: 'Beautiful beach resort photos',
  category: 'accommodation',
  images: [
    { url: img1.url, publicId: img1.publicId, alt: 'Beach view' },
    { url: img2.url, publicId: img2.publicId, alt: 'Room view' }
  ],
  featured: true,
  status: 'active',
  businessName: 'Paradise Beach',
  location: 'Lagos',
  tags: ['vip', 'featured']
});
```

### Update Gallery

```javascript
import { updateGallery } from '@/app/utils/galleryApi';

const updated = await updateGallery(galleryId, {
  title: 'Updated Title',
  featured: false,
  status: 'inactive'
});
```

### Delete Gallery

```javascript
import { deleteGallery } from '@/app/utils/galleryApi';

await deleteGallery(galleryId);
// All associated Cloudinary images are automatically deleted
```

### Reorder Images

```javascript
import { reorderGalleryImages } from '@/app/utils/galleryApi';

await reorderGalleryImages(galleryId, [
  'publicId3',
  'publicId1',
  'publicId2'
]);
```

## Categories

The system supports the following gallery categories:
- **accommodation** - Hotels, resorts, apartments
- **restaurant** - Restaurants, cafes, bars
- **beauty** - Salons, spas, gyms
- **event** - Event venues, banquet halls
- **mobility** - Transportation services
- **other** - Miscellaneous

## Status Options

- **active** - Gallery is visible and available
- **inactive** - Gallery is hidden from listings

## Tags

Available tags for categorization:
- vip
- active
- engaged
- new
- featured
- recommended

## Error Handling

### Common Errors

**Gallery not found**
```json
{
  "message": "Gallery not found",
  "error": "..."
}
```

**Title is required**
```json
{
  "message": "Title is required",
  "error": "..."
}
```

**At least one image is required**
```json
{
  "message": "At least one image is required",
  "error": "..."
}
```

**Cloudinary upload failed**
```json
{
  "message": "Failed to upload image to Cloudinary",
  "error": "Upload error details..."
}
```

## Environment Variables Required

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_API_BASE=http://localhost:3000 (or your API base URL)
```

## Performance Considerations

### Indexes
The Gallery model includes indexes for:
- `category` + `status` - Fast filtering by category and status
- `featured` + `status` - Quick retrieval of featured galleries
- `createdAt` (descending) - Efficient sorting by creation date

### Pagination
- Supports configurable page size (1-100 items per page)
- Default 10 items per page
- Returns total count for UI pagination

### Search
- Searches across title, description, and tags
- Case-insensitive search with regex
- Returns paginated results

## Best Practices

1. **Image Optimization** - Cloudinary automatically optimizes images with quality: 'auto' and fetch_format: 'auto'
2. **Display Order** - Always maintain consistent displayOrder when reordering
3. **Public IDs** - Always store public IDs for safe deletion from Cloudinary
4. **Error Handling** - Always handle Cloudinary failures gracefully; DB deletion continues
5. **Validation** - All inputs are validated on both frontend and backend
6. **Status Management** - Use status flags to control gallery visibility
7. **View Tracking** - Views are incremented each time a gallery is fetched
8. **Tagging** - Use tags for better search and filtering capabilities

## Testing

### Create Gallery
1. Navigate to `/admin/gallery/add-gallery`
2. Fill in form with required fields
3. Upload images
4. Click "Create Gallery"

### View Galleries
1. Navigate to `/admin/gallery/all-gallery`
2. Use filters to search/filter
3. Click cards to view details

### Edit Gallery
1. In gallery list, click "Edit" button
2. Modify details
3. Add/remove/reorder images
4. Save changes

### Delete Gallery
1. In gallery list, click "Delete" button
2. Confirm deletion
3. All images automatically deleted from Cloudinary

## Troubleshooting

**Images not uploading**
- Check Cloudinary credentials in .env.local
- Verify internet connection
- Check browser console for specific errors

**Gallery not appearing in list**
- Verify gallery status is 'active'
- Check if category filter is applied
- Ensure pagination shows the correct page

**Cloudinary images not deleting**
- Check Cloudinary API credentials
- Verify public ID is correct
- Check Cloudinary account permissions

**Database errors**
- Verify MongoDB connection
- Check MongoDB permissions
- Verify Atlas network access

## Future Enhancements

- [ ] Drag-to-reorder images UI
- [ ] Batch upload multiple galleries
- [ ] Image compression options
- [ ] Advanced analytics (views per image)
- [ ] Sharing/embedding galleries
- [ ] Gallery templates
- [ ] Social media integration
- [ ] Rating/reviews system
