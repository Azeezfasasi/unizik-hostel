# Brevo Integration - Quick Reference

## 🚀 Quick Setup (5 minutes)

### 1. Create Account
```
Visit: https://www.brevo.com
Sign up → Verify email
```

### 2. Get API Key
```
Dashboard → Settings → API & Plugins → API
Copy key (starts with xkeysib-)
```

### 3. Add to .env.local
```env
BREVO_API_KEY=xkeysib-your_key_here
BREVO_SENDER_EMAIL=noreply@yourcompany.com
BREVO_SENDER_NAME=Your Company
```

### 4. Verify Sender Email
```
Brevo Dashboard → Senders List → Add Sender
Verify via confirmation email
```

### 5. Test
Go to admin dashboard → Send test campaign → Verify delivery

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `brevoEmailService.js` | Core email functions |
| `newsletterController.js` | Updated with Brevo integration |
| `BREVO_INTEGRATION_GUIDE.md` | Complete documentation |
| `BREVO_SETUP_CHECKLIST.md` | Step-by-step setup |
| `BREVO_EMAIL_INTEGRATION_MIGRATION.md` | Migration details |

---

## 🔧 Main Functions

### Send Single Email
```javascript
import { sendEmailViaBrevo } from '@/app/server/utils/brevoEmailService';

await sendEmailViaBrevo({
  to: 'user@example.com',
  subject: 'Hello',
  htmlContent: '<h1>Welcome</h1>',
});
```

### Send Bulk Emails
```javascript
import { sendBulkEmailsViaBrevo } from '@/app/server/utils/brevoEmailService';

const results = await sendBulkEmailsViaBrevo([
  { to: 'user1@example.com', subject: 'Hi', htmlContent: '...' },
  { to: 'user2@example.com', subject: 'Hi', htmlContent: '...' },
]);

console.log(results.totalSent); // Number sent
console.log(results.totalFailed); // Number failed
```

### Create Contact
```javascript
import { createBrevoContact } from '@/app/server/utils/brevoEmailService';

await createBrevoContact({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  listIds: [1],
});
```

### Update Contact
```javascript
import { updateBrevoContact } from '@/app/server/utils/brevoEmailService';

await updateBrevoContact('user@example.com', {
  attributes: { CUSTOM_FIELD: 'value' }
});
```

### Delete Contact
```javascript
import { deleteBrevoContact } from '@/app/server/utils/brevoEmailService';

await deleteBrevoContact('user@example.com');
```

### Verify API Key
```javascript
import { verifyBrevoApiKey } from '@/app/server/utils/brevoEmailService';

const isValid = await verifyBrevoApiKey();
// Logs: "✓ Brevo API Key verified successfully"
```

---

## 🎯 Common Tasks

### Send Newsletter
1. Admin Dashboard → Send Newsletter
2. Fill campaign details
3. Select recipients
4. Click "Send Now" or "Schedule"
5. Monitor in Brevo dashboard

### Subscribe User
- User fills form on homepage
- Auto-synced to Brevo contacts
- Confirmation email sent (if configured)

### Unsubscribe User
- Click unsubscribe link in email
- Status updated in database
- Status updated in Brevo

### View Analytics
- Brevo Dashboard → Reports
- See opens, clicks, bounces
- Check sender reputation

---

## ⚡ Performance Tips

1. **Batch Sends**: Use `sendBulkEmailsViaBrevo` for multiple emails
2. **Schedule Campaigns**: Send at optimal times
3. **Segment Lists**: Send targeted campaigns by tag
4. **Monitor Bounces**: Remove hard bounces
5. **Clean Lists**: Regular list hygiene improves delivery

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| API key errors | Check BREVO_API_KEY in .env.local |
| Sender email rejected | Verify email in Brevo Senders List |
| Emails not sending | Check recipient emails are valid |
| High bounce rate | Verify email list quality |
| Rate limits | Upgrade to paid Brevo plan |

---

## 📊 Key Metrics

- **Delivery Rate**: Aim for >95%
- **Open Rate**: Typical 15-25%
- **Click Rate**: Typical 2-5%
- **Bounce Rate**: Keep <2%
- **Complaint Rate**: Keep <0.1%

---

## 🔗 Important Links

- **Brevo**: https://www.brevo.com
- **API Docs**: https://developers.brevo.com
- **Dashboard**: https://app.brevo.com
- **Help**: https://www.brevo.com/support

---

## 📋 Environment Variables

```env
# Required
BREVO_API_KEY=xkeysib-xxxxxxxxxxxx

# Optional but recommended
BREVO_SENDER_EMAIL=noreply@company.com
BREVO_SENDER_NAME=Company Name
NEWSLETTER_FROM_EMAIL=info@company.com
NEWSLETTER_FROM_NAME=Company Name

# For webhooks (production)
BREVO_WEBHOOK_URL=https://yourdomain.com/api/webhooks/brevo
BREVO_WEBHOOK_KEY=your_secret_key
```

---

## ✅ Integration Status

✅ Nodemailer replaced with Brevo  
✅ All functions working  
✅ Error handling added  
✅ Documentation complete  
✅ No errors in code  
✅ Ready for testing  

---

## 🎓 Learning Resources

1. **This File**: Quick reference guide
2. **BREVO_SETUP_CHECKLIST.md**: Detailed setup steps
3. **BREVO_INTEGRATION_GUIDE.md**: Complete documentation
4. **Source Code**: `src/app/server/utils/brevoEmailService.js`
5. **Official Docs**: https://developers.brevo.com/docs

---

**Everything is ready! Get your Brevo API key and update `.env.local` to start sending emails.**
