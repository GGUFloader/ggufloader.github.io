# Mobile Testing Guide

## Quick Visual Checklist

### 1. Navigation Menu (All Pages)
**What to check:**
- [ ] Hamburger icon visible on mobile (< 768px)
- [ ] Menu opens when clicking hamburger
- [ ] Menu closes when clicking outside
- [ ] Menu closes when clicking a link
- [ ] Menu closes when pressing Escape
- [ ] Hamburger animates to X when open
- [ ] Menu items are easily tappable

**How to test:**
1. Open any page on mobile or resize browser to < 768px
2. Click the hamburger menu (three lines)
3. Verify menu slides down/appears
4. Click a menu item - should navigate and close
5. Open menu again, click outside - should close
6. Open menu, press Escape - should close

### 2. Homepage Hero Section
**What to check:**
- [ ] Heading readable without zooming
- [ ] Subtitle not too large
- [ ] CTA button easily tappable
- [ ] No horizontal scrolling
- [ ] Philosophy section displays nicely
- [ ] Quote cards not too wide

**Expected behavior:**
- Hero heading: ~1.75rem on mobile
- Button: Full width or centered, min 48px height
- Philosophy cards: Stack vertically on mobile

### 3. Grid Layouts
**What to check:**
- [ ] Features grid: Single column on mobile
- [ ] Download options: Single column on mobile
- [ ] Use cases: Single column on mobile
- [ ] How-to guides: Single column on mobile
- [ ] Model cards: Single column on mobile

**Expected behavior:**
- All grids should be 1 column on screens < 640px
- Should expand to multi-column on larger screens

### 4. Video Section
**What to check:**
- [ ] Video responsive (fits screen width)
- [ ] Maintains 16:9 aspect ratio
- [ ] No overflow or horizontal scroll
- [ ] Playable on mobile

### 5. Buttons and Links
**What to check:**
- [ ] All buttons min 44px height
- [ ] Easy to tap without zooming
- [ ] Button groups stack vertically on mobile
- [ ] Download buttons full width on mobile
- [ ] "Learn more" buttons full width on mobile

### 6. Text and Typography
**What to check:**
- [ ] Body text readable (16px minimum)
- [ ] Headings not too large
- [ ] Line height comfortable (1.5-1.6)
- [ ] No text overflow
- [ ] Code blocks scroll horizontally if needed

### 7. Forms (Hire Me page)
**What to check:**
- [ ] Input fields don't trigger zoom on iOS
- [ ] Fields are full width on mobile
- [ ] Labels clearly visible
- [ ] Submit button easily tappable
- [ ] Error messages visible

### 8. Model Comparison Tool
**What to check:**
- [ ] Filters panel stacks on top on mobile
- [ ] Model cards single column
- [ ] Search input full width
- [ ] Filter tags wrap properly
- [ ] Action buttons stack vertically

## Device-Specific Tests

### iPhone SE (375px width)
- Smallest common screen
- Test all pages load without horizontal scroll
- Verify all touch targets are 44px+
- Check text is readable

### iPhone 12/13/14 (390px width)
- Standard modern iPhone size
- Test navigation menu
- Verify grid layouts
- Check button sizes

### Samsung Galaxy S21 (360px width)
- Common Android size
- Test all interactive elements
- Verify no layout breaks
- Check font sizes

### iPad (768px width)
- Tablet breakpoint
- Should show desktop navigation (no hamburger)
- Grids should be multi-column
- Verify layout transitions smoothly

## Landscape Mode Tests

### Phone Landscape (< 768px height)
- [ ] Navigation still works
- [ ] Content doesn't overflow
- [ ] Hero section adjusts height
- [ ] Buttons remain accessible

## Browser-Specific Tests

### Safari (iOS)
- [ ] No zoom on input focus (16px font-size)
- [ ] Smooth scrolling works
- [ ] Menu animations smooth
- [ ] Touch events work correctly

### Chrome (Android)
- [ ] Menu toggle works
- [ ] Grids display correctly
- [ ] No layout shifts
- [ ] Touch targets adequate

### Samsung Internet
- [ ] All features work
- [ ] CSS renders correctly
- [ ] JavaScript executes properly

## Performance Tests

### Mobile Performance
- [ ] Page loads in < 3 seconds on 3G
- [ ] No layout shift during load
- [ ] Images load progressively
- [ ] Menu responds instantly

### Touch Responsiveness
- [ ] Menu opens immediately on tap
- [ ] Buttons respond to first tap
- [ ] No double-tap required
- [ ] Scrolling is smooth

## Common Issues to Watch For

### ❌ Problems to Avoid
1. **Horizontal scrolling** - Most common mobile issue
2. **Tiny touch targets** - Buttons < 44px
3. **Text too small** - Body text < 16px
4. **Zoom on input** - iOS auto-zoom
5. **Menu not working** - JavaScript not loaded
6. **Grid overflow** - Fixed width columns
7. **Images too large** - Not responsive
8. **Buttons too close** - Hard to tap accurately

### ✅ What Good Looks Like
1. **No horizontal scroll** - Content fits viewport
2. **Easy tapping** - All buttons 44px+ height
3. **Readable text** - 16px+ body, good contrast
4. **Working menu** - Opens/closes smoothly
5. **Single column** - Grids stack on mobile
6. **Responsive images** - Scale to fit
7. **Proper spacing** - Buttons have room
8. **Fast loading** - < 3 seconds on 3G

## Testing Tools

### Browser DevTools
```
Chrome DevTools:
1. F12 or Cmd+Option+I
2. Click device icon (Cmd+Shift+M)
3. Select device or set custom size
4. Test at 375px, 390px, 768px
```

### Real Device Testing
```
1. Connect phone to same WiFi
2. Find computer's IP address
3. Open http://[YOUR-IP]:8000 on phone
4. Test all features
```

### Online Tools
- BrowserStack - Real device testing
- LambdaTest - Cross-browser testing
- Responsively App - Multi-device preview
- Chrome DevTools - Device emulation

## Quick Fix Reference

### If menu doesn't work:
1. Check mobile-menu.js is loaded
2. Check browser console for errors
3. Verify .mobile-menu-toggle exists
4. Verify #nav-menu exists

### If horizontal scroll appears:
1. Check for fixed-width elements
2. Verify container has max-width: 100%
3. Check for large images without max-width
4. Look for grid minmax() values

### If text is too small:
1. Check mobile-fixes.css is loaded
2. Verify media queries are working
3. Check for !important overrides
4. Test with cache cleared

### If buttons are hard to tap:
1. Verify min-height: 44px
2. Check padding is adequate
3. Ensure no overlapping elements
4. Test touch target size

## Automated Testing

### Lighthouse Mobile Audit
```bash
# Run Lighthouse in Chrome DevTools
1. Open DevTools
2. Go to Lighthouse tab
3. Select "Mobile"
4. Click "Generate report"
```

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Responsive Design Checker
```bash
# Use Chrome DevTools Device Mode
1. Toggle device toolbar (Cmd+Shift+M)
2. Test these widths:
   - 320px (very small)
   - 375px (iPhone SE)
   - 390px (iPhone 12)
   - 768px (iPad)
   - 1024px (iPad Pro)
```

## Sign-Off Checklist

Before considering mobile optimization complete:

- [ ] All pages tested on real iPhone
- [ ] All pages tested on real Android
- [ ] Navigation menu works on all pages
- [ ] No horizontal scrolling anywhere
- [ ] All buttons easily tappable
- [ ] Text readable without zooming
- [ ] Forms work without zoom
- [ ] Images are responsive
- [ ] Videos play correctly
- [ ] Lighthouse mobile score 90+
- [ ] No console errors
- [ ] Smooth scrolling
- [ ] Fast page load (< 3s)
- [ ] Works in landscape mode
- [ ] Tested on slow 3G connection

## Report Template

When reporting issues, include:

```
Device: [iPhone 12, Samsung Galaxy S21, etc.]
Browser: [Safari, Chrome, Samsung Internet]
Screen Size: [390x844, etc.]
Issue: [Description]
Steps to Reproduce:
1. 
2. 
3. 
Expected: [What should happen]
Actual: [What actually happens]
Screenshot: [If possible]
```

## Success Metrics

Your mobile site is successful when:
- ✅ 0 horizontal scroll issues
- ✅ 100% of buttons are 44px+ height
- ✅ Page load < 3 seconds on 3G
- ✅ Lighthouse mobile score 90+
- ✅ 0 JavaScript errors
- ✅ All features work on iOS and Android
- ✅ Text readable without zoom
- ✅ Forms usable without zoom
