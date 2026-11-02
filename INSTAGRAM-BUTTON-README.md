# Instagram Floating Button

## Overview
A floating Instagram button appears on all blog posts linking to [@nazary.ai](https://www.instagram.com/nazary.ai).

## Files Created
1. `css/instagram-float-button.css` - Styles for the floating button
2. `js/instagram-float-button.js` - Auto-initialization script

## Features
- ✨ Gradient Instagram brand colors
- 📱 Fully responsive (icon-only on mobile)
- ♿ Accessibility compliant (ARIA labels, keyboard navigation)
- 🎯 Auto-initializes on page load
- 📊 Analytics tracking (Google Analytics & Plausible compatible)
- 🎨 Smooth animations (slide-in, hover, pulse effect)

## Implementation

### For New Blog Posts
Add these two lines in the `<head>` section:

```html
<link rel="stylesheet" href="css/instagram-float-button.css">
<script src="js/instagram-float-button.js" defer></script>
```

Or for blog posts in subdirectories (use-cases/):

```html
<link rel="stylesheet" href="../css/instagram-float-button.css">
<script src="../js/instagram-float-button.js" defer></script>
```

### Button Behavior
- **Desktop**: Shows full button with icon and text "Connect on Instagram"
- **Tablet**: Slightly smaller but still shows text
- **Mobile (< 480px)**: Shows icon only in a circular button

### Positioning
- Fixed position: bottom-right corner
- Desktop: 30px from bottom and right
- Mobile: 20px from bottom and right
- Z-index: 999 (stays above most content)

## Customization

### Change Instagram Account
Edit `js/instagram-float-button.js`, line 20:
```javascript
button.href = 'https://www.instagram.com/nazary.ai'; // Change username here
```

### Change Colors
Edit `css/instagram-float-button.css`, line 4:
```css
background: linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
```

### Change Position
Edit `css/instagram-float-button.css`, lines 3-4:
```css
bottom: 30px;  /* Distance from bottom */
right: 30px;   /* Distance from right */
```

### Disable Animations
Remove these classes in `js/instagram-float-button.js`:
- Remove `.animated` class (line 24) for slide-in animation
- Remove pulse animation trigger (lines 50-52)

## Browser Support
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Analytics
The button automatically tracks clicks if you have:
- Google Analytics (gtag.js)
- Plausible Analytics

Event details:
- **Google Analytics**: Category: "Social", Label: "Instagram Float Button"
- **Plausible**: Event: "Instagram Click", Prop: location = "Float Button"

## Accessibility
- ARIA label: "Connect with me on Instagram"
- Title attribute for hover tooltip
- Keyboard navigable (Tab key)
- Focus outline visible
- No animation interference with keyboard navigation

## Testing
1. Open any blog post with the button installed
2. Check responsive behavior by resizing browser
3. Test keyboard navigation (Tab to focus, Enter to activate)
4. Verify link opens in new tab
5. Check analytics tracking in browser console (if analytics installed)

## Troubleshooting

### Button doesn't appear
- Check browser console for JavaScript errors
- Verify CSS and JS file paths are correct
- Ensure files are loaded (check Network tab in DevTools)

### Button appears twice
- Only include the CSS and JS once per page
- Script has built-in duplicate prevention

### Button overlaps content
- Adjust z-index in CSS file
- Change positioning (bottom/right values)
- Add padding-bottom to page content if needed

## Maintenance
To update the button across all blog posts:
1. Modify CSS or JS files
2. Clear browser cache (Ctrl+F5)
3. No need to edit individual HTML files
