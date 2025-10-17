# 🔍 Debug Checklist - "Form Not Working"

## Quick Diagnostic Steps

### ✅ Step 1: Open diagnose.html
- [ ] File opens in browser
- [ ] All automatic checks are green ✅
- [ ] Click "Send Test Email" button
- [ ] Email sends successfully

**If Step 1 passes:** EmailJS is configured correctly, problem is in hire-me.html

**If Step 1 fails:** Note which check is red ❌ and go to "Fix Based on Error" below

---

### ✅ Step 2: Open hire-me-simple.html
- [ ] File opens in browser
- [ ] Debug info shows "✅ EmailJS library loaded"
- [ ] Debug info shows "✅ EmailJS initialized"
- [ ] Debug info shows "✅ Form found and ready"
- [ ] Fill out form and submit
- [ ] See success message

**If Step 2 passes:** Basic EmailJS works, problem is in complex hire-me.html

**If Step 2 fails:** Note what debug info shows and go to "Fix Based on Error" below

---

### ✅ Step 3: Check Browser Console
- [ ] Open hire-me.html
- [ ] Press F12 (or Cmd+Option+I on Mac)
- [ ] Click "Console" tab
- [ ] Refresh the page
- [ ] Look for messages

**Good messages (working):**
```
✓ Initializing EmailJS...
✓ EmailJS available: true
✓ EmailJS initialized successfully
✓ Setting up contact form...
```

**Bad messages (not working):**
```
✗ EmailJS library not loaded
✗ EmailJS initialization error
✗ Contact form not found
```

---

## Fix Based on Error

### ❌ "EmailJS library NOT loaded"

**Cause:** Script didn't load from CDN

**Check:**
- [ ] Internet connection working?
- [ ] Can you open https://cdn.emailjs.com/sdk/2.6.4/email.min.js in browser?
- [ ] Ad blocker disabled?
- [ ] Firewall not blocking?

**Fix:**
1. Check internet connection
2. Disable ad blockers
3. Try different browser
4. Try incognito/private mode

---

### ❌ "401 Unauthorized"

**Cause:** Wrong Public Key

**Check:**
- [ ] Public Key in hire-me.html matches dashboard?
- [ ] No typos or extra spaces?
- [ ] Key is active in dashboard?

**Fix:**
1. Go to https://dashboard.emailjs.com/
2. Account → General → Copy Public Key
3. Open hire-me.html
4. Line 19: Update `publicKey: "YOUR_KEY_HERE"`
5. Save and test

---

### ❌ "404 Not Found"

**Cause:** Wrong Service ID or Template ID

**Check:**
- [ ] Service ID in hire-me.html matches dashboard?
- [ ] Template ID in hire-me.html matches dashboard?
- [ ] Service is connected in dashboard?
- [ ] Template exists and is saved?

**Fix:**
1. Go to https://dashboard.emailjs.com/
2. Email Services → Copy Service ID
3. Email Templates → Copy Template ID
4. Open hire-me.html
5. Line 20: Update `serviceId: "YOUR_SERVICE_ID"`
6. Line 21: Update `templateId: "YOUR_TEMPLATE_ID"`
7. Save and test

---

### ❌ "429 Too Many Requests"

**Cause:** Rate limit exceeded

**Check:**
- [ ] Sent more than 100 emails this month?
- [ ] Check usage in dashboard

**Fix:**
1. Wait until next month (free tier resets)
2. Or upgrade to paid plan
3. Or use fallback email link

---

### ❌ "Form not found" or "Submit button not found"

**Cause:** HTML elements missing or IDs wrong

**Check:**
- [ ] Form has `id="contactForm"`?
- [ ] Submit button has `id="submitButton"`?
- [ ] Elements exist in HTML?

**Fix:**
1. Open hire-me.html
2. Search for `id="contactForm"`
3. Search for `id="submitButton"`
4. Make sure both exist
5. Check spelling

---

### ❌ Form submits but nothing happens

**Cause:** JavaScript error

**Check:**
- [ ] Browser console shows errors?
- [ ] Any red error messages?

**Fix:**
1. Press F12
2. Click Console tab
3. Copy the error message
4. Send it to me for help

---

## Configuration Verification

### Check Your Credentials

Open hire-me.html and find this section (around line 18):

```javascript
const EMAILJS_CONFIG = {
    publicKey: "Aif7atVmhmC4vCzO2",      // ← Check this
    serviceId: "service_7evq2pa",         // ← Check this
    templateId: "template_u8bup9s"        // ← Check this
};
```

### Verify Each Value

**Public Key:**
- [ ] Go to https://dashboard.emailjs.com/
- [ ] Account → General
- [ ] Copy Public Key
- [ ] Matches hire-me.html? ✅

**Service ID:**
- [ ] Go to https://dashboard.emailjs.com/
- [ ] Email Services
- [ ] Copy Service ID (looks like: service_abc123)
- [ ] Matches hire-me.html? ✅

**Template ID:**
- [ ] Go to https://dashboard.emailjs.com/
- [ ] Email Templates
- [ ] Copy Template ID (looks like: template_xyz789)
- [ ] Matches hire-me.html? ✅

---

## Test Files Checklist

### Files to Test (in order):

1. **diagnose.html** ← Start here!
   - [ ] Opens successfully
   - [ ] All checks pass
   - [ ] Test email sends

2. **hire-me-simple.html**
   - [ ] Opens successfully
   - [ ] Debug info shows success
   - [ ] Form submits successfully

3. **test-emailjs.html**
   - [ ] Opens successfully
   - [ ] Test 1 passes (library)
   - [ ] Test 2 passes (init)
   - [ ] Test 3 passes (send)

4. **hire-me.html** ← Your actual form
   - [ ] Opens successfully
   - [ ] Console shows success messages
   - [ ] Form submits successfully

---

## Information to Collect

If you need help, collect this information:

### From diagnose.html:
- [ ] Screenshot of automatic checks
- [ ] Screenshot of test email result
- [ ] Any error messages

### From Browser Console (F12):
- [ ] Screenshot of console
- [ ] Copy any red error messages
- [ ] Copy any warnings

### From EmailJS Dashboard:
- [ ] Service status (connected/disconnected)
- [ ] Template exists (yes/no)
- [ ] Usage stats (emails sent this month)

---

## Quick Reference

### Open Browser Console:
- **Windows/Linux:** F12 or Ctrl+Shift+I
- **Mac:** Cmd+Option+I

### Clear Browser Cache:
- **Windows/Linux:** Ctrl+Shift+Delete
- **Mac:** Cmd+Shift+Delete

### Hard Refresh:
- **Windows/Linux:** Ctrl+F5
- **Mac:** Cmd+Shift+R

### Test in Incognito:
- **Chrome:** Ctrl+Shift+N (Cmd+Shift+N on Mac)
- **Firefox:** Ctrl+Shift+P (Cmd+Shift+P on Mac)
- **Edge:** Ctrl+Shift+N

---

## Success Indicators

You'll know it's working when:

### In diagnose.html:
- ✅ All checks are green
- ✅ Test email sends successfully
- ✅ "Email sent successfully!" message appears

### In hire-me-simple.html:
- ✅ Debug shows all green checkmarks
- ✅ Form submits without errors
- ✅ Success message appears

### In hire-me.html:
- ✅ Console shows "EmailJS initialized successfully"
- ✅ Form submits without errors
- ✅ Green success banner appears
- ✅ Email arrives in inbox

---

## Still Not Working?

If you've gone through this checklist and it still doesn't work:

1. **Take screenshots of:**
   - diagnose.html results
   - Browser console (F12)
   - Any error messages

2. **Note which step fails:**
   - diagnose.html?
   - hire-me-simple.html?
   - hire-me.html?

3. **Tell me:**
   - What error you see
   - Which file you're testing
   - What the console says

4. **I'll help you fix it!** 🔧

---

**Remember:** 90% of issues are wrong credentials. Double-check your Public Key, Service ID, and Template ID first!
