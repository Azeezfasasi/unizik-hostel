# Gallery System - Quick Reference

## File Locations

### Backend Files
```
src/app/server/
├── models/
│   └── Gallery.js                    # MongoDB schema
├── controllers/
│   └── galleryController.js          # Business logic (8 functions)
└── utils/
    └── cloudinaryService.js          # Cloudinary API wrapper

src/app/api/
└── gallery/
    ├── route.js                      # GET all, POST create
    └── [id]/route.js                 # GET, PUT, DELETE operations
```

### Frontend Files
```
src/app/
├── utils/
│   └── galleryApi.js                 # API client (8 functions)
└── admin/gallery/
    ├── add-gallery/
    │   └── page.jsx                  # Create gallery page
    └── all-gallery/
        └── page.jsx                  # List galleries page
```

## Available Routes

### Admin Pages
- `/admin/gallery/add-gallery` - Create new gallery
- `/admin/gallery/all-gallery` - List and manage galleries
- `/admin/gallery/view/[id]` - View gallery details (needs creation)
- `/admin/gallery/edit/[id]` - Edit gallery (needs creation)

### API Routes
- `GET /api/gallery` - List galleries
- `POST /api/gallery` - Create gallery
- `GET /api/gallery/[id]` - Get single gallery
- `PUT /api/gallery/[id]` - Update gallery
- `DELETE /api/gallery/[id]` - Delete gallery

## Quick Code Snippets

### Fetch All Galleries (Frontend)
```javascript
import { fetchGalleries } from '@/app/utils/galleryApi';

const response = await fetchGalleries({
  category: 'accommodation',
  status: 'active',
  page: 1,
  limit: 10
});
```

### Create Gallery (Frontend)
```javascript
import { createGallery } from '@/app/utils/galleryApi';
import { uploadToCloudinary } from '@/app/utils/cloudinary';

// Upload images first
const img = await uploadToCloudinary(fileData, 'rayob/gallery');

// Create gallery
const gallery = await createGallery({
  title: 'My Gallery',
  category: 'accommodation',
  images: [{
    url: img.url,
    publicId: img.publicId,
    alt: 'Description'
  }],
  featured: true,
  status: 'active',
  tags: ['vip']
});
```

### Update Gallery (Frontend)
```javascript
import { updateGallery } from '@/app/utils/galleryApi';

await updateGallery(galleryId, {
  title: 'Updated Title',
  featured: false
});
```

### Delete Gallery (Frontend)
```javascript
import { deleteGallery } from '@/app/utils/galleryApi';

await deleteGallery(galleryId);
// All Cloudinary images auto-deleted
```

### Reorder Images (Frontend)
```javascript
import { reorderGalleryImages } from '@/app/utils/galleryApi';

await reorderGalleryImages(galleryId, [
  'publicId3',
  'publicId1',
  'publicId2'
]);
```

### Delete Single Image (Frontend)
```javascript
import { deleteGalleryImage } from '@/app/utils/galleryApi';

await deleteGalleryImage(galleryId, publicId);
```

### Add Images to Gallery (Frontend)
```javascript
import { addGalleryImages } from '@/app/utils/galleryApi';

await addGalleryImages(galleryId, [
  { url: 'https://...', publicId: '...', alt: 'Image 1' },
  { url: 'https://...', publicId: '...', alt: 'Image 2' }
]);
```

## Database Schema Summary

```javascript
Gallery {
  title: String (required),              // Gallery name
  description: String,                   // Details
  category: String,                      // Type (accommodation, restaurant, etc)
  images: [{
    url: String,                         // Cloudinary URL
    publicId: String,                    // For Cloudinary deletion
    alt: String,                         // Alternative text
    displayOrder: Number                 // Sort order
  }],
  featured: Boolean,                     // Featured flag
  status: String,                        // active/inactive
  businessName: String,                  // Associated business
  location: String,                      // Geographic location
  tags: [String],                        // Search tags
  views: Number,                         // View count
  createdAt: Date,                       // Creation timestamp
  updatedAt: Date                        // Last update timestamp
}
```

## Categories Available
- `accommodation` - Hotels, resorts, apartments
- `restaurant` - Restaurants, cafes, bars
- `beauty` - Salons, spas, gyms
- `event` - Event venues, banquet halls
- `mobility` - Transportation
- `other` - Miscellaneous

## Controller Functions

### 1. createGallery(req, res)
Creates new gallery with images

### 2. getGallery(req, res)
Fetches single gallery, increments view count

### 3. getAllGalleries(req, res)
Lists galleries with filtering, search, pagination

### 4. updateGallery(req, res)
Updates gallery details and/or images

### 5. deleteGallery(req, res)
Removes gallery and all Cloudinary images

### 6. reorderImages(req, res)
Changes image display order

### 7. deleteImage(req, res)
Removes single image from gallery

### 8. addImagesToGallery(req, res)
Adds images to existing gallery

## Frontend API Functions

### 1. fetchGalleries(filters)
Get list with filtering/pagination/search

### 2. fetchGallery(id)
Get single gallery details

### 3. createGallery(data)
Create new gallery

### 4. updateGallery(id, data)
Update gallery

### 5. deleteGallery(id)
Delete gallery

### 6. reorderGalleryImages(id, imageOrder)
Reorder images

### 7. deleteGalleryImage(id, publicId)
Delete single image

### 8. addGalleryImages(id, images)
Add images to gallery

## Environment Setup

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

## Common Workflows

### Workflow 1: Create and Publish Gallery
```
1. User navigates to /admin/gallery/add-gallery
2. Fills form (title, category, business info, tags)
3. Uploads images (auto-uploaded to Cloudinary)
4. Clicks "Create Gallery"
5. Gallery stored in MongoDB with Cloudinary URLs
6. Redirected to gallery details page
```

### Workflow 2: Edit Gallery
```
1. User views gallery list at /admin/gallery/all-gallery
2. Clicks "Edit" button
3. Updates details (title, category, status, etc)
4. Can add/remove/reorder images
5. Saves changes
6. Images updated in Cloudinary as needed
```

### Workflow 3: Delete Gallery
```
1. User in gallery list clicks "Delete"
2. Confirms deletion
3. All Cloudinary images deleted using publicIds
4. Gallery removed from MongoDB
5. Gallery list refreshed
```

### Workflow 4: Browse and Search
```
1. User navigates to /admin/gallery/all-gallery
2. Optionally applies filters (category, status)
3. Can search by title/description/tags
4. Results paginated
5. Click gallery card to view full details
```

## Error Codes & Meanings

| Code | Message | Cause |
|------|---------|-------|
| 201 | Gallery created successfully | Creation successful |
| 200 | Gallery fetched/updated | Operation successful |
| 400 | Title is required | Missing title field |
| 400 | At least one image is required | No images provided |
| 400 | Gallery ID is required | Missing ID parameter |
| 404 | Gallery not found | Invalid gallery ID |
| 500 | Error creating/updating gallery | Server/DB error |
| 500 | Failed to upload image to Cloudinary | Upload error |

## Next Steps / Future Enhancements

- [ ] View gallery details page (`/admin/gallery/view/[id]`)
- [ ] Edit gallery page (`/admin/gallery/edit/[id]`)
- [ ] Drag-to-reorder images UI
- [ ] Bulk operations (delete, publish)
- [ ] Gallery analytics/statistics
- [ ] Image compression options
- [ ] Social sharing features
- [ ] Gallery templates

## Support & Troubleshooting

### Image Upload Fails
1. Check Cloudinary credentials in .env.local
2. Verify file format (jpg, png, gif, webp)
3. Check file size (< 25MB)
4. Check internet connection

### Gallery Not Appearing
1. Check status = 'active'
2. Clear browser cache
3. Verify database connection
4. Check filters aren't hiding gallery

### Cloudinary Image Not Deleting
1. Verify publicId is correct
2. Check Cloudinary credentials
3. Verify account has delete permission
4. Check image isn't being used elsewhere

### Database Connection Error
1. Verify MongoDB connection string
2. Check network access whitelist
3. Verify database exists
4. Check authentication credentials
