# Hero Slider Management System

## Overview

This document describes the dynamic Hero Slider management system that allows admins to create, update, delete, and manage hero slides through a dashboard interface. All changes are live immediately after saving.

## Architecture

### 1. MongoDB Model (`src/app/server/models/Hero.js`)

Stores hero slide data with the following fields:

```javascript
{
  title: String (200 chars max) - Slide title
  subtitle: String (500 chars max) - Slide description
  cta: {
    label: String (50 chars max) - Button text
    href: String - Button link (e.g., /join-us)
  }
  bg: String - Background gradient or color
  image: {
    src: String - Image URL/path
    alt: String - Alt text for accessibility
  }
  order: Number - Display order (0, 1, 2, etc.)
  isActive: Boolean - Show/hide slide
  createdBy: String - Admin who created it
  updatedBy: String - Admin who last updated it
  timestamps: true - createdAt and updatedAt fields
}
```

### 2. API Endpoints

#### GET /api/hero

**Fetch all hero slides**

- **Query Parameters:**
  - `includeInactive=true` - Include inactive slides (admin only)
- **Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Unite in Faith",
      "subtitle": "Join our community...",
      "cta": { "label": "Join Now", "href": "/join-us" },
      "bg": "linear-gradient(...)",
      "image": { "src": "/images/slide.jpg", "alt": "..." },
      "order": 0,
      "isActive": true,
      "createdAt": "2025-12-25T...",
      "updatedAt": "2025-12-25T..."
    }
  ],
  "count": 1
}
```

#### POST /api/hero

**Create a new hero slide**

- **Request Body:**

```json
{
  "title": "Unite in Faith, Celebrate Culture!",
  "subtitle": "Join a vibrant community...",
  "cta": {
    "label": "Join Our Community",
    "href": "/join-us"
  },
  "bg": "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%)",
  "image": {
    "src": "/images/slide1.jpg",
    "alt": "CANAN USA Community"
  },
  "order": 0,
  "isActive": true,
  "createdBy": "admin@example.com"
}
```

- **Response:** Returns created slide object with `_id`

#### GET /api/hero/[id]

**Fetch a single hero slide**

- **Response:** Returns slide object

#### PUT /api/hero/[id]

**Update a hero slide**

- **Request Body:** Any combination of fields to update

```json
{
  "title": "Updated Title",
  "isActive": false,
  "order": 1,
  "updatedBy": "admin@example.com"
}
```

- **Response:** Returns updated slide object

#### DELETE /api/hero/[id]

**Delete a hero slide**

- **Response:**

```json
{
  "success": true,
  "data": {
    /* deleted slide */
  },
  "message": "Hero slide deleted successfully"
}
```

### 3. Admin Dashboard (`src/app/dashboard/hero-content/page.js`)

**Location:** `/dashboard/hero-content`

**Features:**

- ✅ View all slides in a table format
- ✅ Create new slides with form validation
- ✅ Edit existing slides
- ✅ Delete slides with confirmation
- ✅ Toggle slide visibility (active/inactive)
- ✅ Reorder slides using up/down buttons
- ✅ Real-time updates with success/error messages
- ✅ Loading states and error handling

**Form Fields:**

- Title (required, max 200 chars)
- Subtitle (required, max 500 chars)
- CTA Button Label (required, max 50 chars)
- CTA Button Link (required)
- Background Gradient/Color (optional)
- Image URL (optional)
- Image Alt Text (optional, max 200 chars)
- Display Order (default 0)
- Active Status (checkbox)

### 4. Frontend Component (`src/components/home-component/Hero.js`)

**Features:**

- Fetches slides from `/api/hero` on component mount
- Displays active slides only
- Automatic carousel with touch/mouse drag support
- Keyboard navigation (arrow keys)
- Responsive design (mobile, tablet, desktop)
- Fallback to default slides if API fails
- Loading state handling

**Carousel Controls:**

- Previous/Next buttons
- Dot indicators for slide navigation
- Drag to navigate (15% threshold)
- Arrow keys to navigate

## Setup Instructions

### 1. Database

No migration needed - the schema is created automatically when first slide is created.

### 2. Environment Variables

Ensure `.env.local` has:

```
MONGODB_URI=your_mongodb_connection_string
```

### 3. Access

- Admin goes to `/dashboard/hero-content`
- Homepage automatically displays active slides from database

## Usage Guide

### Creating a Slide

1. Go to `/dashboard/hero-content`
2. Click "Add Slide" button
3. Fill in all required fields (Title, Subtitle, CTA Label, CTA Link)
4. Optionally add background gradient and image
5. Click "Create Slide"
6. Slide appears immediately on homepage if active

### Editing a Slide

1. Find slide in the table
2. Click "Edit" button
3. Modify fields as needed
4. Click "Update Slide"
5. Changes appear immediately

### Deleting a Slide

1. Click "Delete" button on desired slide
2. Confirm deletion in dialog
3. Slide is removed from database and homepage

### Changing Visibility

1. Click the "Active" or "Inactive" badge next to slide
2. Toggles immediately without page reload
3. Inactive slides don't appear on homepage

### Reordering Slides

1. Use the up/down arrows in the "Order" column
2. Click arrow to decrease/increase order number
3. Slides displayed in ascending order (0, 1, 2, etc.)

## Example Requests

### Using cURL

**Fetch all active slides:**

```bash
curl http://localhost:3000/api/hero
```

**Create a slide:**

```bash
curl -X POST http://localhost:3000/api/hero \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unite in Faith, Celebrate Culture!",
    "subtitle": "Join a vibrant community...",
    "cta": {
      "label": "Join Our Community",
      "href": "/join-us"
    },
    "bg": "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 60%)",
    "image": {
      "src": "/images/community.jpg",
      "alt": "Community"
    },
    "order": 0,
    "isActive": true
  }'
```

**Update a slide:**

```bash
curl -X PUT http://localhost:3000/api/hero/[SLIDE_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "order": 1
  }'
```

**Delete a slide:**

```bash
curl -X DELETE http://localhost:3000/api/hero/[SLIDE_ID]
```

## Frontend Integration

The Hero component automatically:

1. Fetches slides on mount from `/api/hero`
2. Filters to show only active slides
3. Displays them in carousel order
4. Falls back to default slides if API fails

No code changes needed in the Hero component when you add/update slides - it's fully dynamic!

## Troubleshooting

### Slides not appearing

- Check if slides are marked as `isActive: true`
- Verify MongoDB connection
- Check browser console for API errors
- Confirm slides are properly ordered

### Admin dashboard loading slowly

- Check MongoDB connection
- Verify API is responding: `GET /api/hero?includeInactive=true`
- Check browser network tab for failed requests

### Images not displaying

- Verify image URL is correct and accessible
- Check if image path is relative to `/public` folder
- Images only appear on lg screens and larger

### Carousel controls not working

- Ensure JavaScript is enabled
- Check for browser console errors
- Verify touch events if on mobile

## Best Practices

1. **Order slides logically** - Start with 0 for first slide
2. **Use descriptive titles** - Help users understand content
3. **Keep subtitles concise** - 500 char max for readability
4. **Add relevant images** - Improves engagement (optional but recommended)
5. **Test links** - Ensure CTA links point to valid pages
6. **Use consistent colors** - Maintain brand identity with gradients
7. **Alt text for images** - Important for accessibility

## Database Queries

### Get all active slides sorted by order:

```javascript
const slides = await Hero.find({ isActive: true }).sort({ order: 1 }).lean();
```

### Get all slides including inactive (admin):

```javascript
const slides = await Hero.find({}).sort({ order: 1 }).lean();
```

### Count active slides:

```javascript
const count = await Hero.countDocuments({ isActive: true });
```

## API Response Status Codes

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad request (missing required fields)
- `404` - Slide not found
- `500` - Server error

## Security Considerations

⚠️ **Important:** Add authentication checks to API routes to ensure only admins can create/update/delete slides.

**Recommended addition to API routes:**

```javascript
// Add authentication middleware
const user = await authenticateUser(request);
if (!user || user.role !== "admin") {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
  });
}
```

## Version History

- **v1.0** (2025-12-25) - Initial hero management system
  - Full CRUD operations
  - Admin dashboard
  - Dynamic rendering
  - Drag carousel
