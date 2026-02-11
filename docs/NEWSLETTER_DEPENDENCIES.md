# Newsletter System - Dependencies & Installation

## 📦 Required npm Packages

Add these to your `package.json`:

```json
{
  "dependencies": {
    "nodemailer": "^6.9.7",
    "mongoose": "^8.0.0",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

## 🔧 Installation Steps

### Step 1: Install Core Dependencies

```bash
npm install nodemailer mongoose
```

OR with yarn:
```bash
yarn add nodemailer mongoose
```

### Step 2: Verify Installation

```bash
npm list nodemailer mongoose
```

You should see:
```
├── mongoose@8.0.0
└── nodemailer@6.9.7
```

### Step 3: Import in Your Files

```javascript
// In your controller or API route
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
```

## 📋 Full Dependency Versions

These are the tested and recommended versions:

```json
{
  "dependencies": {
    "nodemailer": "^6.9.7",
    "mongoose": "^8.0.0"
  }
}
```

## 🌐 Optional Dependencies

For enhanced functionality, you may want to add:

### For SendGrid Integration
```bash
npm install @sendgrid/mail
```

### For Email HTML Building
```bash
npm install juice
```

### For CSV Export
```bash
npm install csv-writer
```

### For Email Validation
```bash
npm install email-validator
```

### For Rate Limiting
```bash
npm install express-rate-limit
```

### For JWT Authentication
```bash
npm install jsonwebtoken
```

## 🏗️ Complete Project Setup

If starting from scratch, here's the full installation sequence:

```bash
# 1. Create Next.js project
npx create-next-app@latest rayob --typescript

# 2. Install dependencies
cd rayob
npm install nodemailer mongoose

# 3. Optional enhanced packages
npm install @sendgrid/mail email-validator jsonwebtoken

# 4. Copy environment file
cp .env.newsletter.example .env.local

# 5. Update .env.local with your values
nano .env.local

# 6. Run development server
npm run dev
```

## 🔍 Version Compatibility

| Package | Version | Why |
|---------|---------|-----|
| nodemailer | ^6.9.7 | Latest stable SMTP client |
| mongoose | ^8.0.0 | Latest MongoDB driver with TypeScript support |
| Next.js | ^14.0.0 | Latest with App Router |
| Node.js | >=18.0.0 | Required for async/await |

## 📝 Important Notes

### Node.js Version
```bash
# Check your Node.js version
node --version

# Should be >= 18.0.0
# If not, upgrade from https://nodejs.org/
```

### npm vs yarn
Choose one package manager and stick with it:

```bash
# Using npm
npm install nodemailer mongoose

# Using yarn
yarn add nodemailer mongoose

# Using pnpm
pnpm add nodemailer mongoose

# Using bun
bun add nodemailer mongoose
```

## 🚀 Next Steps After Installation

1. **Configure Environment Variables**
   ```bash
   cp .env.newsletter.example .env.local
   # Edit .env.local with actual values
   ```

2. **Test Email Connection**
   ```javascript
   // Create a test file: test-email.js
   import { connectDB } from '@/utils/db';
   
   await connectDB();
   console.log('✅ Database connected');
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

4. **Test API Endpoints**
   ```bash
   # Test subscribe endpoint
   curl -X POST http://localhost:3000/api/newsletter?action=subscribe \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

## 🐛 Troubleshooting Installation

### Issue: "Cannot find module 'nodemailer'"
**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: "mongoose version conflict"
**Solution:**
```bash
# Force install compatible version
npm install mongoose@8.0.0 --force
```

### Issue: "EACCES: permission denied"
**Solution:**
```bash
# On macOS/Linux
sudo npm install

# Or fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
```

### Issue: "ERESOLVE unable to resolve dependency"
**Solution:**
```bash
# Use npm 7+ legacy flag if needed
npm install --legacy-peer-deps
```

## 📦 Verify Installation

Create a test file to verify everything is working:

```javascript
// test-setup.js
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

console.log('✅ nodemailer imported successfully');
console.log('✅ mongoose imported successfully');

// Test transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email transporter ready');
  }
});

// Test database connection
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');
  await mongoose.disconnect();
} catch (error) {
  console.log('❌ MongoDB connection error:', error.message);
}
```

Run it:
```bash
node test-setup.js
```

## 🎯 What Gets Installed

### nodemailer (^6.9.7)
- SMTP client for sending emails
- Supports Gmail, SendGrid, AWS SES, and custom SMTP
- No external API required

### mongoose (^8.0.0)
- MongoDB object modeling
- Schema validation
- Query building
- Relationships and references

## 📚 Documentation

After installation, check:
- [Nodemailer Docs](https://nodemailer.com)
- [Mongoose Docs](https://mongoosejs.com)
- [NEWSLETTER_API_DOCUMENTATION.md](./NEWSLETTER_API_DOCUMENTATION.md)
- [NEWSLETTER_SETUP_GUIDE.md](./NEWSLETTER_SETUP_GUIDE.md)

## 💾 Save These Steps

Quick reference for future installations:

```bash
# Complete setup in one go
npm install nodemailer mongoose && \
cp .env.newsletter.example .env.local && \
echo "✅ Newsletter system ready! Edit .env.local next."
```

---

You're all set! 🎉 Proceed to NEWSLETTER_SETUP_GUIDE.md for next steps.
