# Newsletter System - Complete Setup & Integration Guide

## 📋 Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Database Setup](#database-setup)
4. [Email Setup](#email-setup)
5. [Authentication Integration](#authentication-integration)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Installation

### Step 1: Install Required Dependencies

```bash
npm install nodemailer mongoose
# or
yarn add nodemailer mongoose
```

### Step 2: Verify File Structure

```
src/
├── app/
│   ├── api/
│   │   └── newsletter/
│   │       ├── route.js                 (Main routes)
│   │       └── [id]/
│   │           └── route.js             (Dynamic routes)
│   └── server/
│       ├── controllers/
│       │   └── newsletterController.js  (Business logic)
│       └── models/
│           └── Newsletter.js            (Database schemas)
└── utils/
    ├── db.js                            (Database connection)
    └── newsletter-api.js                (Frontend utilities)
```

---

## Configuration

### Step 1: Copy Environment Template

```bash
cp .env.newsletter.example .env.local
```

### Step 2: Update .env.local

Fill in your actual values:

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/rayob

# Email (Gmail with App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
NEWSLETTER_FROM_EMAIL=noreply@rayobengineering.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Setup

### Step 1: MongoDB Connection

Make sure your `src/utils/db.js` is properly configured:

```javascript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ Database connection failed', error);
    throw error;
  }
};
```

### Step 2: Verify Collections

The system will automatically create these collections:

- **subscribers** - User subscriptions
- **campaigns** - Newsletter campaigns
- **templates** - Email templates
- **activitylogs** - Engagement tracking

---

## Email Setup

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication**
   - Go to https://myaccount.google.com/security
   - Enable 2-step verification

2. **Generate App Password**
   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

3. **Update .env.local**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

### Option 2: SendGrid (Production)

1. **Create SendGrid Account**
   - Sign up at https://sendgrid.com

2. **Get API Key**
   - Go to Settings > API Keys
   - Create new API key with Mail Send permission

3. **Update .env.local**
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.xxxxx...
   ```

### Option 3: AWS SES

1. **Setup AWS SES**
   - Verify email addresses in SES console
   - Request production access

2. **Configure Credentials**
   ```env
   EMAIL_SERVICE=aws-ses
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   ```

### Option 4: Custom SMTP

Update the transporter in `newsletterController.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

---

## Authentication Integration

### Update with Your Auth System

The system uses these headers for authentication:

```
x-user-role: admin     (required for admin operations)
x-user-id: user123     (required for tracking edits)
```

### Option 1: JWT Authentication

Update `requireAdmin()` and `getUserId()` in routes:

```javascript
import jwt from 'jsonwebtoken';

const requireAdmin = (req) => {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return false;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role === 'admin';
  } catch (error) {
    return false;
  }
};

const getUserId = (req) => {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return 'anonymous';
  }
};
```

### Option 2: Session-Based Authentication

```javascript
import { getSession } from '@auth0/nextjs-auth0';

const requireAdmin = async (req) => {
  const session = await getSession();
  return session?.user?.role === 'admin';
};

const getUserId = async (req) => {
  const session = await getSession();
  return session?.user?.id;
};
```

### Option 3: Custom Auth Context

```javascript
const requireAdmin = (req) => {
  const userRole = req.headers.get('x-user-role');
  return userRole === 'admin';
};

const getUserId = (req) => {
  return req.headers.get('x-user-id');
};
```

---

## Usage Examples

### Example 1: Subscribe to Newsletter (Frontend Form)

```javascript
'use client';

import { useState } from 'react';
import { subscriberAPI } from '@/utils/newsletter-api';

export default function SubscribeForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target);
      const result = await subscriberAPI.subscribe(
        formData.get('email'),
        formData.get('firstName'),
        formData.get('lastName'),
        ['general']
      );

      if (result.success) {
        setMessage('Successfully subscribed!');
        e.target.reset();
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="space-y-4">
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        required
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
      />
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
```

### Example 2: Create and Send Campaign (Admin Dashboard)

```javascript
'use client';

import { useState } from 'react';
import { campaignAPI } from '@/utils/newsletter-api';

export default function CreateCampaign() {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('authToken');

  const handleCreateAndSend = async () => {
    setLoading(true);

    try {
      // Create campaign
      const createResult = await campaignAPI.create(
        {
          title: 'Spring Sale 2024',
          subject: 'Exclusive Spring Offer - 50% Off',
          content: 'Dear valued customer...',
          htmlContent: '<html>...</html>',
          campaignType: 'promotional',
          recipients: {
            type: 'segment',
            selectedSegments: ['premium'],
          },
        },
        token
      );

      if (!createResult.success) throw new Error(createResult.error);

      const campaignId = createResult.campaign._id;

      // Send campaign
      const sendResult = await campaignAPI.send(campaignId, token);

      if (sendResult.success) {
        alert(`Campaign sent to ${sendResult.statistics.sentCount} subscribers!`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleCreateAndSend} disabled={loading}>
      {loading ? 'Sending...' : 'Create & Send Campaign'}
    </button>
  );
}
```

### Example 3: Subscriber Management Dashboard

```javascript
'use client';

import { useEffect, useState } from 'react';
import { subscriberAPI } from '@/utils/newsletter-api';

export default function SubscriberDashboard() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const result = await subscriberAPI.getAllSubscribers(
          page,
          20,
          'active',
          '',
          [],
          token
        );
        setSubscribers(result.subscribers);
      } catch (error) {
        console.error('Error fetching subscribers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, [page, token]);

  const handleDelete = async (email) => {
    if (!confirm('Are you sure?')) return;

    try {
      await subscriberAPI.deleteSubscriber(email, token);
      setSubscribers(subscribers.filter(s => s.email !== email));
      alert('Subscriber deleted');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Status</th>
            <th>Subscribed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map(sub => (
            <tr key={sub._id}>
              <td>{sub.email}</td>
              <td>{sub.firstName} {sub.lastName}</td>
              <td>{sub.subscriptionStatus}</td>
              <td>{new Date(sub.subscribedAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDelete(sub.email)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Testing

### Test with cURL

```bash
# Subscribe
curl -X POST http://localhost:3000/api/newsletter?action=subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Get subscribers (Admin)
curl -X GET "http://localhost:3000/api/newsletter?action=subscribers&page=1" \
  -H "x-user-role: admin"

# Create campaign (Admin)
curl -X POST http://localhost:3000/api/newsletter?action=create-campaign \
  -H "Content-Type: application/json" \
  -H "x-user-role: admin" \
  -H "x-user-id: admin123" \
  -d '{
    "title": "Test Campaign",
    "subject": "Test Subject",
    "content": "Test content",
    "campaignType": "informational",
    "recipients": {"type": "all"}
  }'
```

### Test Email Sending

```javascript
// In your server actions or API route
const testEmail = async () => {
  const result = await campaignAPI.send('campaign_id', token);
  console.log('Send result:', result);
};
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] Email service configured and tested
- [ ] MongoDB URI set and database accessible
- [ ] Environment variables configured
- [ ] Authentication system integrated
- [ ] Admin role validation implemented
- [ ] SMTP/email credentials secured
- [ ] Rate limiting configured
- [ ] Error handling and logging in place
- [ ] Database backups configured
- [ ] Monitoring/alerts set up

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod_user:password@prod-cluster.mongodb.net/rayob-prod
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxx
NEXT_PUBLIC_APP_URL=https://rayobengineering.com
JWT_SECRET=your_very_long_random_secret_key
```

### Vercel Deployment

1. **Push to GitHub**
2. **Connect Repository to Vercel**
3. **Set Environment Variables in Vercel Dashboard**
   - Add all .env variables
4. **Deploy**

```bash
git push origin main
```

---

## Troubleshooting

### Email Not Sending

1. **Check Gmail App Password**
   ```bash
   # Verify in .env.local
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

2. **Check Error Logs**
   ```javascript
   console.error('Email error:', error);
   ```

3. **Verify Unsubscribe Link**
   - Ensure `NEXT_PUBLIC_APP_URL` is correctly set

### Database Connection Errors

1. **Check MongoDB URI**
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
   ```

2. **Verify IP Whitelist**
   - Add your IP to MongoDB Atlas IP whitelist
   - Or allow all IPs (0.0.0.0/0) for development

3. **Check Network**
   ```bash
   ping cluster.mongodb.net
   ```

### Authentication Issues

1. **Verify Admin Role**
   - Check `x-user-role: admin` header is sent
   - Verify authentication system integration

2. **Check Token**
   - Verify JWT token is valid and not expired
   - Check token includes required claims

### Campaign Not Sending to All Subscribers

1. **Check Recipient Type**
   ```javascript
   recipients: {
     type: "all"  // Ensure this is set
   }
   ```

2. **Verify Subscriber Status**
   - Only "active" subscribers receive campaigns
   - Check bounce count and subscriber status

3. **Check Rate Limiting**
   - Verify `MAX_RECIPIENTS_PER_SEND` setting
   - May need to send in batches

---

## Performance Optimization

### For Large Subscriber Lists

```javascript
// Use pagination
const result = await subscriberAPI.getAllSubscribers(page, 50);

// Use bulk operations
await subscriberAPI.bulkUpdate(subscriberIds, updateData);

// Index database for faster queries
db.subscribers.createIndex({ email: 1 });
db.subscribers.createIndex({ subscriptionStatus: 1 });
db.subscribers.createIndex({ tags: 1 });
```

### For Campaign Sending

```javascript
// Send in batches for large campaigns
const BATCH_SIZE = 500;

for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
  const batch = recipients.slice(i, i + BATCH_SIZE);
  await sendBatch(batch);
  await delay(5000); // Rate limiting
}
```

---

## Support & Resources

- MongoDB Documentation: https://docs.mongodb.com
- Nodemailer: https://nodemailer.com
- Next.js API Routes: https://nextjs.org/docs/api-routes
- Email Best Practices: https://www.mailgun.com/blog/

---

For additional help or issues, please check the API documentation or contact your development team.
