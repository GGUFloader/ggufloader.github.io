# Analytics and Monitoring Implementation

This document describes the comprehensive analytics and monitoring system implemented for the GGUF Loader website.

## Overview

The analytics system consists of three main components:

1. **Privacy-Compliant Analytics** (`analytics.js`) - Google Analytics 4 integration with privacy controls
2. **Core Web Vitals Monitoring** (`core-web-vitals-monitor.js`) - Real-time performance monitoring with alerts
3. **User Behavior Tracking** (`user-behavior-tracker.js`) - Detailed user interaction and behavior analysis

## Configuration

All analytics systems are configured through `analytics-config.js`. Update this file to customize:

- Google Analytics measurement ID
- Performance thresholds
- Privacy settings
- Tracking preferences

### Setting up Google Analytics

1. Create a Google Analytics 4 property
2. Get your measurement ID (format: G-XXXXXXXXXX)
3. Update `analytics-config.js`:

```javascript
googleAnalytics: {
    measurementId: 'G-YOUR-MEASUREMENT-ID', // Replace with your actual ID
    // ... other settings
}
```

## Features

### Privacy-Compliant Analytics

- **Consent Management**: Shows privacy-compliant consent banner
- **Data Minimization**: Only collects necessary data
- **Anonymization**: IP addresses are anonymized
- **User Control**: Users can decline tracking
- **GDPR Compliance**: Respects user privacy preferences

#### Events Tracked:
- Page views with content categorization
- User flows and navigation patterns
- Conversion events (downloads, form submissions)
- Engagement metrics (scroll depth, time on page)
- Error tracking (JavaScript errors, failed requests)

### Core Web Vitals Monitoring

- **Real-time Monitoring**: Continuous tracking of performance metrics
- **Performance Alerts**: Automatic alerts for performance issues
- **Visual Dashboard**: Interactive performance dashboard
- **Historical Data**: Performance trends over time

#### Metrics Monitored:
- **LCP** (Largest Contentful Paint) - Loading performance
- **FID** (First Input Delay) - Interactivity
- **CLS** (Cumulative Layout Shift) - Visual stability
- **FCP** (First Contentful Paint) - Perceived loading
- **TTFB** (Time to First Byte) - Server response time

#### Alert System:
- Browser notifications for administrators
- Console warnings for developers
- Visual alerts in the UI
- Email alerts (configurable)

#### Performance Dashboard:
- Click the 📊 button (bottom right) to view real-time metrics
- Color-coded performance ratings
- Historical performance data
- Detailed metric breakdowns

### User Behavior Tracking

- **Content Analytics**: Popular pages and content engagement
- **Navigation Patterns**: User flow analysis and path optimization
- **Download Tracking**: Model download patterns and preferences
- **Heatmap Data**: Click patterns and user interaction zones
- **Search Analytics**: Site search behavior and query analysis

#### Tracked Interactions:
- Button clicks (floating buttons, CTAs, navigation)
- Link clicks (internal vs external)
- Form interactions and submissions
- Model comparison tool usage
- Documentation navigation patterns
- Search queries and result interactions
- Download events with file categorization

## Implementation Details

### Script Loading Order

1. `analytics-config.js` - Configuration (loaded synchronously)
2. `analytics.js` - Core analytics (loaded with defer)
3. `core-web-vitals-monitor.js` - Performance monitoring (loaded with defer)
4. `user-behavior-tracker.js` - Behavior tracking (loaded with defer)

### Privacy Considerations

- **Consent Required**: No tracking until user consents
- **Data Minimization**: Only essential data is collected
- **Anonymization**: Personal identifiers are removed
- **Retention Limits**: Data is not stored indefinitely
- **User Rights**: Users can withdraw consent at any time

### Performance Impact

- **Lazy Loading**: Scripts load after page content
- **Event Throttling**: Prevents excessive event firing
- **Batch Processing**: Events are batched for efficiency
- **Sampling**: Heatmap tracking uses sampling to reduce load
- **Conditional Loading**: Features can be disabled to reduce overhead

## Usage

### For Developers

```javascript
// Access analytics manager
window.analyticsManager.trackEvent('custom_event', {
    event_category: 'Custom',
    custom_parameter: 'value'
});

// Access performance monitor
window.cwvMonitor.getStatus();

// Access behavior tracker
window.userBehaviorTracker.getStatus();
```

### For Administrators

1. **View Performance Dashboard**: Click the 📊 button on any page
2. **Monitor Alerts**: Performance alerts appear automatically
3. **Check Console**: Development information in browser console
4. **Analytics Data**: View detailed analytics in Google Analytics dashboard

## Customization

### Adding Custom Events

```javascript
// Track custom user actions
if (window.analyticsManager) {
    window.analyticsManager.trackEvent('custom_action', {
        event_category: 'User Actions',
        action_type: 'button_click',
        element_id: 'custom-button'
    });
}
```

### Modifying Performance Thresholds

Update `analytics-config.js`:

```javascript
coreWebVitals: {
    alertThresholds: {
        LCP: { warning: 2000, critical: 3500 }, // Custom thresholds
        // ... other metrics
    }
}
```

### Disabling Features

```javascript
// Disable specific tracking features
userBehavior: {
    enableHeatmapTracking: false,
    enableScrollTracking: false,
    // ... other settings
}
```

## Data Privacy

This implementation follows privacy best practices:

- **Consent-based**: No tracking without explicit user consent
- **Transparent**: Clear information about data collection
- **Minimal**: Only necessary data is collected
- **Secure**: Data is transmitted securely
- **Controllable**: Users can opt-out at any time

## Browser Support

- **Modern Browsers**: Full support for Chrome, Firefox, Safari, Edge
- **Performance Observer**: Required for Core Web Vitals monitoring
- **Local Storage**: Used for consent management
- **Graceful Degradation**: Features degrade gracefully in older browsers

## Troubleshooting

### Common Issues

1. **Analytics not loading**: Check measurement ID in config
2. **Consent banner not showing**: Verify privacy settings
3. **Performance dashboard not working**: Check browser support for PerformanceObserver
4. **Events not tracking**: Ensure consent has been granted

### Debug Mode

Enable debug mode in development:

```javascript
// In analytics-config.js
development: {
    enableConsoleLogging: true,
    enableDebugDashboard: true
}
```

## Compliance

This implementation helps with:

- **GDPR**: Consent management and data minimization
- **CCPA**: User privacy controls
- **COPPA**: No tracking of minors without consent
- **ePrivacy**: Cookie consent and transparency

## Maintenance

### Regular Tasks

1. **Update Measurement ID**: When changing GA properties
2. **Review Thresholds**: Adjust performance thresholds as needed
3. **Monitor Consent Rates**: Track user consent acceptance
4. **Analyze Performance**: Review Core Web Vitals trends
5. **Update Privacy Policy**: Keep privacy documentation current

### Updates

When updating the analytics system:

1. Test in development environment first
2. Verify consent flow still works
3. Check performance impact
4. Update documentation as needed
5. Monitor for errors after deployment

## Support

For issues or questions about the analytics implementation:

1. Check browser console for error messages
2. Verify configuration in `analytics-config.js`
3. Test with debug mode enabled
4. Review this documentation for troubleshooting steps