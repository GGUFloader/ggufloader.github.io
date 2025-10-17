# ⚡ Quick Fix - "EmailJS service is not available"

## 🎯 3-Step Fix

### Step 1: Open Test Tool (2 minutes)
```
1. Open test-emailjs.html in your browser
2. Click "Test EmailJS Library" button
3. Click "Test Initialization" button
4. Click "Send Test Email" button
```

**What to look for:**
- ✅ All tests pass → EmailJS is working!
- ❌ Test 1 fails → Library not loading (see below)
- ❌ Test 2 fails → Wrong Public Key (see below)
- ❌ Test 3 fails → Wrong Service/Template ID (see below)

### Step 2: Check Browser Console (1 minute)
```
1. Press F12 (or Cmd+Option+I on Mac)
2. Click "Console" tab
3. Refresh the page
4. Look for these messages:
```

**Good (Working):**
```
✓ Initializing EmailJS...
✓ EmailJS available: true
✓ EmailJS initialized successfully
✓ Setting up contact form...
```

**Bad (Not Working):**
```
✗ EmailJS library not loaded
✗ EmailJS initialization error
✗ Contact form not found
```

### Step 3: Fix Based on Error

## 🔴 Error: "EmailJS library not loaded"

**Cause:** CDN script didn't load

**Quick Fix:**
1. Check internet connection
2. Disable ad blockers
3. Try different browser
4. Check if this URL works: https://cdn.emailjs.com/sdk/2.6.4/email.min.js

## 🔴 Error: "401 Unauthorized"

**Cause:** Wrong Public Key

**Quick Fix:**
1. Go to https://dashboard.emailjs.com/
2. Click Account → General
3. Copy your Public Key
4. Open hire-me.html
5. Find line ~19: `publicKey: "..."`
6. Replace with your actual Public Key
7. Save and refresh

## 🔴 Error: "404 Not Found"

**Cause:** Wrong Service ID or Template ID

**Quick Fix:**
1. Go to https://dashboard.emailjs.com/
2. Go to Email Services → Copy Service ID
3. Go to Email Templates → Copy Template ID
4. Open hire-me.html
5. Find line ~20: `serviceId: "..."`
6. Find line ~21: `templateId: "..."`
7. Replace with your actual IDs
8. Save and refresh

## 🔴 Error: "429 Too Many Requests"

**Cause:** Rate limit exceeded (100 emails/month on free tier)

**Quick Fix:**
1. Wait until next month
2. Or upgrade to paid plan
3. Or use fallback email link

## 🔴 Error: "Service is not available"

**Cause:** Multiple possible issues

**Quick Fix:**
1. Open test-emailjs.html
2. Run tests to see specific error
3. Follow fix for that specific error above

## ✅ Verification

After fixing, you should see:

**In Browser Console:**
```
✓ EmailJS initialized successfully
✓ Setting up contact form...
```

**In test-emailjs.html:**
```
✅ EmailJS library loaded
✅ EmailJS initialized successfully!
✅ Email sent successfully!
```

**In hire-me.html:**
```
Form submits → Green success message → Email received
```

## 📋 Quick Checklist

- [ ] Internet connection working
- [ ] test-emailjs.html tests all pass
- [ ] Browser console shows success messages
- [ ] Public Key is correct (no typos)
- [ ] Service ID is correct (no typos)
- [ ] Template ID is correct (no typos)
- [ ] Email service connected in dashboard
- [ ] Template exists in dashboard
- [ ] Not over rate limit

## 🆘 Still Not Working?

**Read the full guide:**
→ [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**Check your setup:**
→ [FIX-SUMMARY.md](FIX-SUMMARY.md)

**Verify configuration:**
→ [emailjs-setup.md](emailjs-setup.md)

## 💡 Pro Tips

1. **Always test with test-emailjs.html first**
   - Faster to diagnose
   - Clear error messages
   - Step-by-step testing

2. **Check browser console**
   - Press F12
   - Look for red errors
   - Read the messages

3. **Verify credentials**
   - Double-check Public Key
   - Double-check Service ID
   - Double-check Template ID
   - No extra spaces!

4. **Use incognito mode**
   - Disables extensions
   - Fresh start
   - No cache issues

5. **Try different browser**
   - Chrome
   - Firefox
   - Edge

## 🎯 Most Common Issues

| Issue | Frequency | Fix Time |
|-------|-----------|----------|
| Wrong Public Key | 40% | 2 min |
| Library not loading | 30% | 5 min |
| Wrong Service/Template ID | 20% | 2 min |
| Service not connected | 5% | 3 min |
| Rate limit exceeded | 5% | Wait or upgrade |

## 📞 Need More Help?

1. **Read full troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. **Check what was fixed:** [FIX-SUMMARY.md](FIX-SUMMARY.md)
3. **EmailJS docs:** https://www.emailjs.com/docs/
4. **EmailJS support:** https://www.emailjs.com/support/

---

**Remember:** 90% of issues are wrong credentials. Double-check your Public Key, Service ID, and Template ID!
