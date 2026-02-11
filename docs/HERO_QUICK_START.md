# Hero Slider - Quick Start Guide

## What's New

A complete dynamic hero slider management system that allows admins to update hero content without code changes.

## Getting Started

### 1. Access the Admin Dashboard

Go to: `http://localhost:3000/dashboard/hero-content`

### 2. Create Your First Slide

- Click **"Add Slide"** button
- Fill in the required fields:
  - **Title**: Main heading (max 200 characters)
  - **Subtitle**: Description text (max 500 characters)
  - **CTA Button Label**: Text on the button (max 50 characters)
  - **CTA Button Link**: Where button should point (e.g., `/join-us`)

### 3. Optional Fields

- **Background**: Gradient or solid color (CSS gradient string)
- **Image URL**: Path to image file (e.g., `/images/slide.jpg`)
- **Image Alt Text**: Accessibility description
- **Display Order**: Number to control slide order (0, 1, 2, etc.)
- **Active**: Toggle to show/hide slide on homepage

### 4. Manage Existing Slides

- **Edit**: Click "Edit" button to modify any slide
- **Delete**: Click "Delete" to remove (with confirmation)
- **Visibility**: Click the Active/Inactive badge to toggle
- **Reorder**: Use arrows in the Order column to change display sequence

## API Endpoints

### Get All Active Slides

```bash
GET /api/hero
```

### Get All Slides (Including Inactive)

```bash
GET /api/hero?includeInactive=true
```

### Create New Slide

```bash
POST /api/hero
Content-Type: application/json

{
  "title": "Slide Title",
  "subtitle": "Slide description",
  "cta": { "label": "Button Text", "href": "/link" },
  "bg": "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
  "image": { "src": "/images/slide.jpg", "alt": "Description" },
  "order": 0,
  "isActive": true
}
```

### Update Slide

```bash
PUT /api/hero/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "order": 1
}
```

### Delete Slide

```bash
DELETE /api/hero/{id}
```

## How It Works

1. **Admin adds/updates slides** via `/dashboard/hero-content`
2. **Data stored in MongoDB** with timestamps and audit info
3. **Homepage automatically fetches** slides from API
4. **Only active slides displayed** in the carousel
5. **Changes appear immediately** (no page reload needed)

## Features

✅ **Full CRUD Operations** - Create, read, update, delete slides  
✅ **Drag & Drop Carousel** - Touch, mouse, and keyboard support  
✅ **Active/Inactive Toggle** - Show/hide slides without deleting  
✅ **Custom Ordering** - Control slide display sequence  
✅ **Admin Dashboard** - Beautiful, responsive interface  
✅ **API Endpoints** - Programmatic access to slide data  
✅ **Fallback Images** - Images only on large screens  
✅ **Error Handling** - Graceful fallback to default slides  
✅ **Real-time Updates** - Changes instant across all pages

## Database Schema

Each slide stores:

- Title, Subtitle
- CTA Button (label + link)
- Background (gradient/color)
- Image (src + alt)
- Display Order
- Active Status
- Created By / Updated By
- Timestamps

## Common Tasks

### Add a Promotional Banner

1. Go to Hero Content dashboard
2. Title: "Special Offer"
3. Add image and CTA button
4. Set order to 0 (show first)
5. Click Create

### Hide a Slide Temporarily

1. Find slide in table
2. Click the "Active" badge
3. Slide disappears from homepage instantly

### Reorder Slides

1. Use up/down arrows in Order column
2. Slides display in ascending order (0, 1, 2...)

### Delete Multiple Slides

1. Click Delete on each slide
2. Confirm when prompted
3. Deleted slides removed from homepage

## Troubleshooting

### Slides not showing

- Verify slides are marked "Active"
- Check if order numbers are set (should be 0, 1, 2...)
- Refresh the page

### Images not displaying

- Images only show on laptop screens (lg breakpoint)
- Check image URL is correct
- Verify image file exists in `/public` folder

### Changes not appearing

- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server
- Check browser console for errors

### MongoDB errors

- Verify `.env.local` has `MONGODB_URI` set
- Check MongoDB connection is active
- Restart dev server

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── hero/
│   │       ├── route.js (GET, POST)
│   │       └── [id]/route.js (GET, PUT, DELETE)
│   ├── server/
│   │   └── models/
│   │       └── Hero.js (MongoDB schema)
│   ├── dashboard/
│   │   └── hero-content/
│   │       └── page.js (Admin UI)
│   └── components/
│       └── home-component/
│           └── Hero.js (Carousel component)
```

## Next Steps

1. ✅ Add at least 3 slides to your hero slider
2. ✅ Test the carousel navigation
3. ✅ Verify images load correctly
4. ✅ Set appropriate CTAs for your business
5. ✅ Test on mobile devices
6. ✅ Add authentication to API routes (recommended)

## Security Note

⚠️ Currently, the API endpoints allow anyone to create/modify slides. Consider adding authentication middleware to restrict access to authorized admins only.

**Example:**

```javascript
// Add to API routes
const user = await authenticateUser(request);
if (!user?.isAdmin) {
  return new Response("Unauthorized", { status: 401 });
}
```

## Documentation

For complete API documentation and advanced usage, see:

- `docs/HERO_MANAGEMENT_SYSTEM.md`
