# Welcome/About Section Management System

## Overview

A complete dynamic Welcome/About section management system that allows admins to create, update, delete, and manage welcome content sections through a dashboard interface. The HomeAbout component automatically fetches and displays this content dynamically.

## Architecture

### 1. MongoDB Model (`src/app/server/models/Welcome.js`)

Stores welcome section data with the following fields:

```javascript
{
  title: String (200 chars max) - Section title (e.g., "About CANAN USA")
  description1: String (1000 chars max) - First paragraph (required)
  description2: String (1000 chars max) - Second paragraph (optional)
  image: {
    src: String - Image URL/path
    alt: String - Alt text for accessibility
  }
  button: {
    label: String (50 chars max) - Button text (required)
    href: String - Button link (required, e.g., /about-us)
  }
  order: Number - Display order (0, 1, 2, etc.)
  isActive: Boolean - Show/hide section
  createdBy: String - Admin who created it
  updatedBy: String - Admin who last updated it
  timestamps: true - createdAt and updatedAt fields
}
```

### 2. API Endpoints

#### GET /api/welcome

**Fetch all active welcome sections**

- **Query Parameters:**
  - `includeInactive=true` - Include inactive sections (admin only)
- **Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "About CANAN USA",
      "description1": "The Christian Association...",
      "description2": "Founded on the principles...",
      "image": { "src": "/images/about.jpg", "alt": "Community" },
      "button": { "label": "Learn More", "href": "/about-us" },
      "order": 0,
      "isActive": true,
      "createdAt": "2025-12-25T...",
      "updatedAt": "2025-12-25T..."
    }
  ],
  "count": 1
}
```

#### POST /api/welcome

**Create a new welcome section**

- **Request Body:**

```json
{
  "title": "About CANAN USA",
  "description1": "The Christian Association of Nigerian-Americans...",
  "description2": "Founded on the principles...",
  "image": {
    "src": "/images/about.jpg",
    "alt": "CANAN USA Community"
  },
  "button": {
    "label": "Learn More",
    "href": "/about-us"
  },
  "order": 0,
  "isActive": true,
  "createdBy": "admin@example.com"
}
```

- **Response:** Returns created section object with `_id`

#### GET /api/welcome/[id]

**Fetch a single welcome section**

- **Response:** Returns section object

#### PUT /api/welcome/[id]

**Update a welcome section**

- **Request Body:** Any combination of fields to update

```json
{
  "title": "Updated Title",
  "description1": "Updated description...",
  "isActive": false,
  "updatedBy": "admin@example.com"
}
```

- **Response:** Returns updated section object

#### DELETE /api/welcome/[id]

**Delete a welcome section**

- **Response:**

```json
{
  "success": true,
  "data": {
    /* deleted section */
  },
  "message": "Welcome section deleted successfully"
}
```

### 3. Admin Dashboard (`src/app/dashboard/welcome-cta-content/page.js`)

**Location:** `/dashboard/welcome-cta-content`

**Features:**

- ✅ View all sections in a table format
- ✅ Create new sections with form validation
- ✅ Edit existing sections
- ✅ Delete sections with confirmation
- ✅ Toggle section visibility (active/inactive)
- ✅ Reorder sections using up/down buttons
- ✅ Real-time updates with success/error messages
- ✅ Loading states and error handling

**Form Fields:**

- Section Title (required, max 200 chars)
- First Paragraph (required, max 1000 chars)
- Second Paragraph (optional, max 1000 chars)
- Image URL (optional)
- Image Alt Text (optional, max 200 chars)
- Button Label (required, max 50 chars)
- Button Link (required)
- Display Order (default 0)
- Active Status (checkbox)

### 4. Frontend Component (`src/components/home-component/HomeAbout.js`)

**Features:**

- Fetches first active section from `/api/welcome` on component mount
- Displays section title, paragraphs, image, and button
- Automatic fallback to default content if API fails
- Loading state handling
- Responsive design (mobile, tablet, desktop)
- Image optimization with Next.js Image component

**Data Flow:**

```
API GET /api/welcome
    ↓
Returns first active section
    ↓
HomeAbout displays dynamically
    ↓
Shows fallback if no sections found
```

## Setup Instructions

### 1. Database

No migration needed - the schema is created automatically when first section is created.

### 2. Environment Variables

Ensure `.env.local` has:

```
MONGODB_URI=your_mongodb_connection_string
```

### 3. Access

- Admin goes to `/dashboard/welcome-cta-content`
- Homepage displays sections automatically from first section (order 0)

## Usage Guide

### Creating a Section

1. Go to `/dashboard/welcome-cta-content`
2. Click "Add Section" button
3. Fill in all required fields:
   - Title (e.g., "About CANAN USA")
   - First Paragraph (main content)
   - Button Label (e.g., "Learn More")
   - Button Link (e.g., "/about-us")
4. Optionally add:
   - Second paragraph
   - Image URL and alt text
5. Click "Create Section"
6. Section appears on homepage if active

### Editing a Section

1. Find section in the table
2. Click "Edit" button
3. Modify fields as needed
4. Click "Update Section"
5. Changes appear immediately on homepage

### Deleting a Section

1. Click "Delete" button on desired section
2. Confirm deletion in dialog
3. Section is removed from database and homepage

### Changing Visibility

1. Click the "Active" or "Inactive" badge next to section
2. Toggles immediately without page reload
3. Inactive sections don't appear on homepage

### Reordering Sections

1. Use the up/down arrows in the "Order" column
2. Click arrow to decrease/increase order number
3. Sections displayed in ascending order (0, 1, 2, etc.)

## Example Requests

### Using cURL

**Fetch active welcome section:**

```bash
curl http://localhost:3001/api/welcome
```

**Create a section:**

```bash
curl -X POST http://localhost:3001/api/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "title": "About CANAN USA",
    "description1": "The Christian Association of Nigerian-Americans is...",
    "description2": "Founded on the principles of faith-centered leadership...",
    "image": {
      "src": "/images/about.jpg",
      "alt": "CANAN USA Community"
    },
    "button": {
      "label": "Learn More",
      "href": "/about-us"
    },
    "order": 0,
    "isActive": true
  }'
```

**Update a section:**

```bash
curl -X PUT http://localhost:3001/api/welcome/[SECTION_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "description1": "Updated content..."
  }'
```

**Delete a section:**

```bash
curl -X DELETE http://localhost:3001/api/welcome/[SECTION_ID]
```

## Frontend Integration

The HomeAbout component automatically:

1. Fetches sections on mount from `/api/welcome`
2. Displays the first active section (order 0)
3. Falls back to default content if API fails or no sections found
4. Shows loading state while fetching

No code changes needed when you add/update sections - it's fully dynamic!

## Troubleshooting

### Section not appearing

- Check if section is marked as `isActive: true`
- Verify MongoDB connection
- Check browser console for API errors
- Confirm section has `order: 0` (first to display)

### Admin dashboard loading slowly

- Check MongoDB connection
- Verify API is responding: `GET /api/welcome?includeInactive=true`
- Check browser network tab for failed requests

### Images not displaying

- Verify image URL is correct and accessible
- Check if image path is relative to `/public` folder
- Test image URL directly in browser

### Changes not appearing

- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server
- Check browser console for errors

### MongoDB errors

- Verify `.env.local` has `MONGODB_URI` set
- Check MongoDB connection is active
- Restart dev server

## Database Queries

### Get active welcome section:

```javascript
const section = await Welcome.findOne({ isActive: true })
  .sort({ order: 1 })
  .lean();
```

### Get all sections including inactive (admin):

```javascript
const sections = await Welcome.find({}).sort({ order: 1 }).lean();
```

### Count active sections:

```javascript
const count = await Welcome.countDocuments({ isActive: true });
```

## API Response Status Codes

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad request (missing required fields)
- `404` - Section not found
- `500` - Server error

## Security Considerations

⚠️ **Important:** Add authentication checks to API routes to ensure only admins can create/update/delete sections.

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

## Component Structure

The HomeAbout component:

1. Fetches data from API
2. Manages loading state
3. Has fallback content
4. Displays image, title, paragraphs, and button
5. Responsive across all screen sizes

### Code Example

```javascript
export default function HomeAbout() {
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWelcome = async () => {
      const res = await fetch("/api/welcome");
      const result = await res.json();
      if (result.success && result.data.length > 0) {
        setSection(result.data[0]);
      } else {
        setSection(defaultSection);
      }
      setLoading(false);
    };
    fetchWelcome();
  }, []);

  // Render section with fallback
}
```

## Best Practices

1. **Write clear descriptions** - Both paragraphs should be informative
2. **Use relevant images** - Improves visual appeal
3. **Keep links accurate** - Test CTA buttons
4. **Alt text matters** - Important for accessibility and SEO
5. **Organize with order** - Use consistent numbering (0, 1, 2...)
6. **Test on mobile** - Ensure responsive layout works
7. **Keep sections active** - Inactive sections not displayed

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── welcome/
│   │       ├── route.js (GET, POST)
│   │       └── [id]/route.js (GET, PUT, DELETE)
│   ├── server/
│   │   └── models/
│   │       └── Welcome.js (MongoDB schema)
│   ├── dashboard/
│   │   └── welcome-cta-content/
│   │       └── page.js (Admin UI)
│   └── components/
│       └── home-component/
│           └── HomeAbout.js (Dynamic component)
```

## Multiple Sections

The system supports multiple sections (e.g., "About", "Mission", "Values"). Each section can have:

- Different content
- Different images
- Different buttons
- Display order
- Active/inactive status

Display all active sections by modifying HomeAbout to map through `result.data` instead of just using `result.data[0]`.

## Version History

- **v1.0** (2025-12-25) - Initial welcome/about management system
  - Full CRUD operations
  - Admin dashboard
  - Dynamic rendering
  - Responsive design
