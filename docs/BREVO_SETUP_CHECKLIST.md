# Brevo Integration Setup Checklist

## ✅ Integration Complete

Your newsletter system has been successfully integrated with **Brevo** for email sending.

---

## 📋 Pre-Deployment Checklist

### 1. **Brevo Account Setup** (If not already done)
- [ ] Create account at [Brevo.com](https://www.brevo.com)
- [ ] Verify email address
- [ ] Accept terms and conditions

### 2. **API Key Configuration**
- [ ] Get API key from Brevo dashboard (Settings → API & Plugins)
- [ ] Add `BREVO_API_KEY` to `.env.local`:
  ```env
  BREVO_API_KEY=xkeysib-your_key_here
  ```
- [ ] Run `verifyBrevoApiKey()` to test (optional)

### 3. **Sender Email Verification**
- [ ] Create/verify sender email in Brevo dashboard (Senders List)
- [ ] Check sender email in `.env.local`:
  ```env
  BREVO_SENDER_EMAIL=noreply@rayobengineering.com
  BREVO_SENDER_NAME=Rayob Engineering
  ```
- [ ] Verify the confirmation email from Brevo

### 4. **SPF & DKIM Setup** (For production)
- [ ] Add SPF record to domain DNS:
  ```
  v=spf1 include:sendingdomain.brevo.com ~all
  ```
- [ ] Add DKIM records (available in Brevo dashboard)
- [ ] Allow 24 hours for DNS propagation

### 5. **Test Email Sending**
- [ ] Use admin dashboard to send test campaign
- [ ] Verify email arrives in inbox
- [ ] Check for unsubscribe link
- [ ] Monitor delivery in Brevo dashboard

### 6. **Environment Variables**
Ensure these are set in `.env.local`:
```env
# Email Configuration - Brevo
EMAIL_SERVICE=brevo
BREVO_API_KEY=xkeysib-your_actual_key
BREVO_SENDER_EMAIL=noreply@rayobengineering.com
BREVO_SENDER_NAME=Rayob Engineering
NEWSLETTER_FROM_EMAIL=info@rayobengineering.com
NEWSLETTER_FROM_NAME=Rayob Engineering

# Optional Webhook (for production)
BREVO_WEBHOOK_URL=https://yourdomain.com/api/webhooks/brevo
BREVO_WEBHOOK_KEY=your_webhook_secret_key
```

---

## 🔧 Files Modified/Created

### New Files Created
✅ `src/app/server/utils/brevoEmailService.js` (470+ lines)
- Email sending functions
- Contact management functions
- Event tracking functions
- API verification function

✅ `BREVO_INTEGRATION_GUIDE.md` (500+ lines)
- Complete setup instructions
- API reference
- Features documentation
- Troubleshooting guide

### Files Updated
✅ `src/app/server/controllers/newsletterController.js`
- Replaced Nodemailer with Brevo
- Added Brevo contact sync
- Updated subscribe/unsubscribe functions
- Updated send newsletter function
- Updated delete subscriber function

✅ `.env.local`
- Added Brevo configuration variables
- Added webhook settings

---

## 🎯 Key Changes

### What's Different
1. **Email Sending**: Now uses Brevo API instead of SMTP
2. **Contact Sync**: Subscribers auto-sync to Brevo contacts
3. **Analytics**: Better email tracking and analytics
4. **Reliability**: 99.9% uptime guarantee with Brevo
5. **Rate Limits**: Based on Brevo plan (free: 300/day, paid: higher)

### What's the Same
- API endpoints (no frontend changes needed)
- Database schema (no migrations needed)
- Newsletter workflow (same user experience)

---

## 📊 Brevo Plans

| Feature | Free | Starter | Business |
|---------|------|---------|----------|
| Daily emails | 300 | Unlimited | Unlimited |
| Contacts | 500 | Unlimited | Unlimited |
| Automation | Basic | Advanced | Advanced+ |
| API | ✓ | ✓ | ✓ |
| Support | Email | Priority | Premium |
| Price | Free | $20/mo | Custom |

---

## 🧪 Testing Steps

### 1. Test API Key
```javascript
// In browser console or test script
import { verifyBrevoApiKey } from '@/app/server/utils/brevoEmailService';
await verifyBrevoApiKey();
// Should output: "✓ Brevo API Key verified successfully"
```

### 2. Test Single Email
Use the admin dashboard:
1. Go to **Send Newsletter** page
2. Create a test campaign
3. Send to single email
4. Check inbox and Brevo dashboard

### 3. Test Subscription
1. Fill newsletter form on homepage
2. Submit
3. Check Brevo contacts list for new subscriber
4. Verify email verification (if enabled)

### 4. Test Unsubscribe
1. Click unsubscribe link in email
2. Verify status changed in Brevo
3. Verify status changed in database

---

## 📞 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "API Key not configured" | Add BREVO_API_KEY to .env.local |
| Emails not sending | Verify sender email in Brevo |
| 403 errors | Check API key is correct |
| Contacts not syncing | Check Brevo list IDs |
| High bounce rate | Verify email list quality |

See `BREVO_INTEGRATION_GUIDE.md` for detailed troubleshooting.

---

## 🚀 Next Steps

1. **Get Brevo API Key** (if you don't have one)
   - Visit [Brevo.com](https://www.brevo.com)
   - Sign up → Get API key

2. **Add API Key to .env.local**
   ```bash
   BREVO_API_KEY=xkeysib-xxxxxxxxxxxx
   ```

3. **Test the Integration**
   - Go to admin dashboard
   - Send a test campaign
   - Monitor in Brevo dashboard

4. **Set Up Webhooks** (Optional, for production)
   - Configure in Brevo dashboard
   - Webhook endpoint: `/api/webhooks/brevo`

5. **Monitor & Optimize**
   - Check delivery rates in Brevo dashboard
   - Monitor bounces and complaints
   - Optimize send times

---

## 📚 Documentation

- **Main Guide**: `BREVO_INTEGRATION_GUIDE.md`
- **API Functions**: See `src/app/server/utils/brevoEmailService.js`
- **Newsletter Controller**: See `src/app/server/controllers/newsletterController.js`
- **Official Brevo API**: https://developers.brevo.com/

---

## ✨ Features Now Available

✅ Professional email sending via Brevo  
✅ Auto contact sync to Brevo  
✅ Built-in email analytics  
✅ Bounce and complaint handling  
✅ Bulk email sending  
✅ Email templates support  
✅ Webhook integration ready  
✅ Multi-language support  
✅ A/B testing (Brevo feature)  
✅ Advanced segmentation  

---

## 🔐 Security Notes

- API key is stored in `.env.local` (not in version control)
- Webhook endpoint can be secured with secret key
- All API calls are HTTPS
- Sensitive data is not logged
- Rate limiting is applied automatically

---

## 💡 Tips

1. **Free Plan**: Perfect for testing and small businesses
2. **SPF/DKIM**: Improves deliverability significantly
3. **List Cleaning**: Regular cleanup improves metrics
4. **Segmentation**: Send targeted campaigns based on tags
5. **Automation**: Set up triggers in Brevo dashboard

---

## 📈 Success Metrics to Track

- Email delivery rate (aim for >95%)
- Open rate (typical: 15-25%)
- Click rate (typical: 2-5%)
- Bounce rate (aim for <2%)
- Complaint rate (aim for <0.1%)
- Unsubscribe rate (typical: 0.1-0.3%)

---

**Status**: ✅ Ready for testing and deployment!

For detailed setup instructions, see `BREVO_INTEGRATION_GUIDE.md`
