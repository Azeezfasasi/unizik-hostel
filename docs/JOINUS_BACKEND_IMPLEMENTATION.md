# CANAN USA Membership Join Us - Backend Implementation Guide

## Overview

This documentation covers the complete backend implementation for the CANAN USA "Join Us" membership application system. The system includes:

- MongoDB model for storing applications
- Express-like API routes for member submissions and admin management
- Brevo email integration for automated notifications
- Comprehensive admin dashboard endpoints
- Full audit trail tracking

## Architecture

```
src/app/
├── api/
│   └── joinus/
│       ├── route.js                    # POST (create), GET (list all)
│       ├── stats/
│       │   └── overview/route.js       # Admin stats/analytics
│       └── [id]/
│           ├── route.js                # GET (single), PUT (edit), DELETE
│           ├── status/route.js         # PUT (change status)
│           └── reply/route.js          # POST (send admin reply)
├── server/
│   ├── models/
│   │   └── Joinus.js                  # MongoDB schema
│   ├── controllers/
│   │   └── joinusController.js        # Business logic (reference only)
│   ├── services/
│   │   └── emailService.js            # Brevo email templates
│   └── utils/
│       └── dbConnect.js               # MongoDB connection helper
```

## Database Model

### Joinus Schema

The model stores complete membership application data with admin fields:

#### Personal Information

- `firstName` (String, required)
- `lastName` (String, required)
- `email` (String, required, lowercase)
- `phone` (String, required)
- `dateOfBirth` (Date, required)

#### Location & Background

- `country` (String, required)
- `state` (String, required)
- `city` (String, required)
- `placeOfOrigin` (String, optional) - Place in Nigeria

#### Membership Details

- `membershipType` (String, enum: 'regular', 'student', 'corporate')
- `interests` (Array of Strings)
- `skills` (String, optional)

#### Application Details

- `motivation` (String, required) - Why they want to join
- `howHeardAbout` (String, enum) - Social media, friend/family, church, website, event, news, other
- `agreeToTerms` (Boolean)
- `agreeToContact` (Boolean)

#### Admin Fields

- `status` (String, enum: 'pending', 'under-review', 'approved', 'rejected')
- `adminNotes` (String, optional)
- `adminReply` (String, optional)
- `lastUpdatedBy` (String) - Admin name
- `lastUpdatedAt` (Date)
- `statusChangedAt` (Date)
- `createdAt` (Date) - Auto timestamp
- `updatedAt` (Date) - Auto timestamp

## API Endpoints

### 1. Create Membership Application

**POST** `/api/joinus`

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "country": "United States",
  "state": "California",
  "city": "Los Angeles",
  "placeOfOrigin": "Lagos",
  "membershipType": "regular",
  "interests": ["Religious Advocacy", "Youth Programs"],
  "skills": "Marketing, Event Planning",
  "motivation": "I want to serve my community...",
  "howHeardAbout": "social_media",
  "agreeToTerms": true,
  "agreeToContact": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    /* full application object */
  }
}
```

**Emails Sent:**

- Confirmation email to member
- New application notification to admin

---

### 2. Get All Applications (Admin)

**GET** `/api/joinus`

**Query Parameters:**

- `status` (optional) - Filter by status: pending, under-review, approved, rejected
- `sortBy` (optional) - Field to sort by (default: createdAt)
- `order` (optional) - asc or desc (default: desc)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Example:**

```
GET /api/joinus?status=pending&sortBy=createdAt&page=1&limit=20
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      /* application objects */
    }
  ],
  "pagination": {
    "total": 45,
    "pages": 3,
    "currentPage": 1,
    "pageSize": 20
  }
}
```

---

### 3. Get Single Application

**GET** `/api/joinus/[id]`

**Response:**

```json
{
  "success": true,
  "data": {
    /* full application object */
  }
}
```

---

### 4. Update Application Status (Admin)

**PUT** `/api/joinus/[id]/status`

**Request Body:**

```json
{
  "status": "approved",
  "adminNotes": "Application reviewed and approved"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    /* updated application object */
  }
}
```

**Emails Sent:**

- Status change notification to member
- Admin notification of status change

---

### 5. Send Admin Reply to Member

**POST** `/api/joinus/[id]/reply`

**Request Body:**

```json
{
  "adminReply": "Thank you for your application. We would like to schedule a call with you...",
  "adminNotes": "Follow up required"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Reply sent successfully",
  "data": {
    /* updated application object */
  }
}
```

**Emails Sent:**

- Reply email to member
- Admin notification of reply sent

---

### 6. Edit Application (Admin)

**PUT** `/api/joinus/[id]`

**Request Body:**

```json
{
  "firstName": "John",
  "email": "john.doe@example.com",
  "membershipType": "student",
  "status": "under-review",
  "adminNotes": "Updated contact info",
  "lastUpdatedBy": "Admin Name"
}
```

**Editable Fields:**

- Personal info: firstName, lastName, email, phone, dateOfBirth
- Location: country, state, city, placeOfOrigin
- Membership: membershipType, interests, skills
- Application: motivation, howHeardAbout
- Admin: status, adminNotes

**Response:**

```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": {
    /* updated application object */
  }
}
```

**Email Sent:**

- Update notification to admin

---

### 7. Delete Application (Admin)

**DELETE** `/api/joinus/[id]`

**Response:**

```json
{
  "success": true,
  "message": "Application deleted successfully",
  "data": {
    /* deleted application object */
  }
}
```

---

### 8. Get Admin Statistics

**GET** `/api/joinus/stats/overview`

**Response:**

```json
{
  "success": true,
  "data": {
    "totalApplications": 150,
    "byStatus": {
      "pending": 45,
      "underReview": 30,
      "approved": 60,
      "rejected": 15
    },
    "membershipTypeBreakdown": [
      { "_id": "regular", "count": 100 },
      { "_id": "student", "count": 30 },
      { "_id": "corporate", "count": 20 }
    ],
    "topInterests": [
      { "_id": "Religious Advocacy", "count": 89 },
      { "_id": "Youth Programs", "count": 76 },
      { "_id": "Education & Scholarship", "count": 65 },
      { "_id": "Community Service", "count": 62 },
      { "_id": "Humanitarian Aid", "count": 55 }
    ],
    "recentApplications": [
      /* 5 most recent */
    ]
  }
}
```

---

## Email Templates

All emails are sent via Brevo with professional HTML templates. The system includes:

### 1. Application Confirmation

Sent to member upon successful submission

- Confirms receipt of application
- Displays member information
- Sets expectations (2-3 business days review)
- Contact information for questions

### 2. Status Change Notification

Sent when admin changes application status

- New status badge (Pending/Under Review/Approved/Rejected)
- Admin notes (if any)
- Call-to-action based on status

### 3. Admin Reply

Sent when admin sends a message to member

- Personal message from admin
- Contact information

### 4. Admin New Application Notification

Sent to admin email when new application submitted

- Full applicant details
- Link to admin dashboard
- All application information

### 5. Admin Update Notification

Sent to admin when changes are made

- Type of update (status changed, reply sent, notes updated)
- Updated information
- Applicant details

### Environment Configuration

Emails require these environment variables (already in `.env.local`):

```env
# Brevo Configuration
EMAIL_SERVICE=brevo
BREVO_API_KEY=xkeysib-[your-key]
BREVO_SENDER_EMAIL=info@rayobengineering.com
BREVO_SENDER_NAME=Rayob Engineering
NEWSLETTER_FROM_EMAIL=info@rayobengineering.com
NEWSLETTER_FROM_NAME=Rayob Engineering

# Admin Notifications
ADMIN_NOTIFICATION_EMAIL=info@rayobengineering.com

# App URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Email Service Functions

Located in `src/app/server/services/emailService.js`:

```javascript
// Generic email sender
sendEmail({ to, subject, htmlContent, textContent, replyTo });

// Send multiple recipients
sendEmailToMultiple({ recipients, subject, htmlContent, textContent });

// Member confirmations
sendApplicationConfirmation(memberData);
sendStatusChangeNotification(memberData, newStatus);
sendAdminReply(memberData);

// Admin notifications
sendAdminNotification(memberData);
sendAdminUpdateNotification(memberData, updateType);
```

## Frontend Integration

Update the form submission endpoint in `src/app/join-us/page.js`:

```javascript
const response = await fetch("/api/joinus", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(formData),
});
```

This is already configured in the current component.

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common status codes:

- `201` - Created successfully
- `200` - Success
- `400` - Bad request (validation errors)
- `404` - Not found
- `500` - Server error

## Security Considerations

For production, implement:

1. **Authentication/Authorization**

   - Admin endpoints should verify admin role
   - Use JWT or session tokens
   - Rate limiting on submission endpoint

2. **Input Validation**

   - All endpoints validate required fields
   - Email format validation
   - Date validation
   - Enum field validation

3. **Data Privacy**

   - Hash sensitive data if needed
   - Implement GDPR compliance
   - Secure admin dashboard access
   - Audit logs for all changes

4. **Email Security**
   - SPF/DKIM records configured
   - Verify Brevo webhook signatures
   - Rate limit email sending

## Testing

### Test Member Submission

```bash
curl -X POST http://localhost:3000/api/joinus \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+12025551234",
    "dateOfBirth": "1990-01-15",
    "country": "United States",
    "state": "California",
    "city": "Los Angeles",
    "placeOfOrigin": "Lagos",
    "membershipType": "regular",
    "interests": ["Religious Advocacy"],
    "skills": "Marketing",
    "motivation": "I want to serve",
    "howHeardAbout": "social_media",
    "agreeToTerms": true,
    "agreeToContact": true
  }'
```

### Test Admin List

```bash
curl http://localhost:3000/api/joinus?status=pending&page=1&limit=10
```

### Test Status Update

```bash
curl -X PUT http://localhost:3000/api/joinus/[APPLICATION_ID]/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "adminNotes": "Application approved"
  }'
```

## Troubleshooting

### Emails Not Sending

1. Verify `BREVO_API_KEY` in `.env.local`
2. Check Brevo account has sufficient balance
3. Verify sender email is verified in Brevo
4. Check email service logs for Brevo errors

### Database Connection Issues

1. Verify `MONGODB_URI` is correct
2. Check MongoDB network access allows connection
3. Verify MongoDB user credentials
4. Check connection pooling settings

### Admin Dashboard Access

1. Verify admin authentication is implemented
2. Check admin email in `ADMIN_NOTIFICATION_EMAIL`
3. Verify application IDs in URLs

## Future Enhancements

- File uploads (resume, certificates)
- Application timeline/workflow
- Bulk email actions
- Advanced filtering and search
- Export applications (CSV/PDF)
- Interview scheduling integration
- Payment processing for membership fees
- API key authentication for external integrations
