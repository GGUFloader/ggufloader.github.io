/**
 * Cross-Page Analytics and Monitoring System
 * Tracks user navigation patterns between homepage and documentation
 */

class CrossPageAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.navigationPath = [];
    this.interactions = [];
    this.performanceMetrics = {};
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.trackPageLoad();
    this.startPerformanceMonitoring();
    
    console.log('📊 Cross-page analytics initialized');
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setupEventListeners() {
    // Track cross-page link clicks
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (link && this.isCrossPageLink(link)) {
        this.trackCrossPageNavigation(link, event);
      }
    });

    // Track content preview interactions
    document.addEventListener('click', (event) => {
      if (event.target.closest('.content-preview')) {
        this.trackContentPreviewInteraction(event);
      }
    });

    // Track related content clicks
    document.addEventListener('click', (event) => {
      if (event.target.closest('.related-content')) {
        this.trackRelatedContentClick(event);
      }
    });

    // Track breadcrumb navigation
    document.addEventListener('click', (event) => {
      if (event.target.closest('.breadcrumb-nav')) {
        this.trackBreadcrumbNavigation(event);
      }
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackVisibilityChange();
    });

    // Track scroll behavior for engagement
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackScrollEngagement();
      }, 250);
    });

    // Track before page unload
    window.addEventListener('beforeunload', () => {
      this.trackPageExit();
    });
  }

  isCrossPageLink(link) {
    const href = link.getAttribute('href');
    if (!href) return false;

    const currentPath = window.location.pathname;
    const isHomepage = currentPath === '/' || currentPath === '/index.html';
    const isDocsLink = href.includes('/docs/');
    const isHomepageLink = href === '/' || href === '/index.html' || href.includes('#');

    // Cross-page if going from homepage to docs or vice versa
    return (isHomepage && isDocsLink) || (!isHomepage && isHomepageLink);
  }

  trackPageLoad() {
    const pageData = {
      type: 'page_load',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: {
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        isHomepage: this.isHomepage(),
        isDocumentation: this.isDocumentationPage()
      },
      user: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      }
    };

    this.navigationPath.push(pageData);
    this.sendAnalytics('page_load', pageData);
  }

  trackCrossPageNavigation(link, event) {
    const navigationData = {
      type: 'cross_page_navigation',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      source: {
        page: window.location.pathname,
        section: this.getCurrentSection(),
        linkText: link.textContent.trim(),
        linkHref: link.getAttribute('href')
      },
      target: {
        href: link.getAttribute('href'),
        isExternal: link.hostname !== window.location.hostname
      },
      interaction: {
        clickX: event.clientX,
        clickY: event.clientY,
        timeOnPage: Date.now() - this.startTime
      }
    };

    this.interactions.push(navigationData);
    this.sendAnalytics('cross_page_navigation', navigationData);
  }

  trackContentPreviewInteraction(event) {
    const preview = event.target.closest('.content-preview');
    const previewData = {
      type: 'content_preview_interaction',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      preview: {
        id: preview.id || 'unknown',
        title: preview.querySelector('h3, h4, .preview-title')?.textContent || 'unknown',
        source: preview.dataset.source || 'unknown',
        action: event.target.classList.contains('expand-btn') ? 'expand' : 'click'
      },
      page: window.location.pathname,
      timeOnPage: Date.now() - this.startTime
    };

    this.interactions.push(previewData);
    this.sendAnalytics('content_preview_interaction', previewData);
  }

  trackRelatedContentClick(event) {
    const relatedItem = event.target.closest('.related-content-item');
    const relatedData = {
      type: 'related_content_click',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      content: {
        title: relatedItem?.querySelector('.title')?.textContent || 'unknown',
        href: event.target.getAttribute('href') || relatedItem?.querySelector('a')?.getAttribute('href'),
        position: Array.from(relatedItem?.parentNode.children || []).indexOf(relatedItem) + 1
      },
      page: window.location.pathname,
      section: this.getCurrentSection()
    };

    this.interactions.push(relatedData);
    this.sendAnalytics('related_content_click', relatedData);
  }

  trackBreadcrumbNavigation(event) {
    const breadcrumbData = {
      type: 'breadcrumb_navigation',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      breadcrumb: {
        text: event.target.textContent.trim(),
        href: event.target.getAttribute('href'),
        level: Array.from(event.target.closest('.breadcrumb-nav').querySelectorAll('a')).indexOf(event.target) + 1
      },
      page: window.location.pathname
    };

    this.interactions.push(breadcrumbData);
    this.sendAnalytics('breadcrumb_navigation', breadcrumbData);
  }

  trackVisibilityChange() {
    const visibilityData = {
      type: 'visibility_change',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      visible: !document.hidden,
      page: window.location.pathname,
      timeOnPage: Date.now() - this.startTime
    };

    this.sendAnalytics('visibility_change', visibilityData);
  }

  trackScrollEngagement() {
    const scrollData = {
      type: 'scroll_engagement',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      scroll: {
        position: window.scrollY,
        percentage: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100),
        direction: this.lastScrollY > window.scrollY ? 'up' : 'down'
      },
      page: window.location.pathname
    };

    this.lastScrollY = window.scrollY;
    this.sendAnalytics('scroll_engagement', scrollData);
  }

  trackPageExit() {
    const exitData = {
      type: 'page_exit',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: window.location.pathname,
      timeOnPage: Date.now() - this.startTime,
      interactions: this.interactions.length,
      navigationPath: this.navigationPath.length
    };

    // Use sendBeacon for reliable exit tracking
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/analytics', JSON.stringify(exitData));
    } else {
      this.sendAnalytics('page_exit', exitData);
    }
  }

  startPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      this.monitorWebVitals();
    }

    // Monitor cross-page navigation performance
    this.monitorNavigationPerformance();
  }

  monitorWebVitals() {
    // This would integrate with web-vitals library if available
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.performanceMetrics.navigationTiming = {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            firstPaint: entry.responseEnd - entry.requestStart
          };
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
  }

  monitorNavigationPerformance() {
    // Track time between cross-page link clicks and page loads
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      this.trackHistoryChange('pushState');
      return originalPushState.apply(history, args);
    };

    history.replaceState = (...args) => {
      this.trackHistoryChange('replaceState');
      return originalReplaceState.apply(history, args);
    };

    window.addEventListener('popstate', () => {
      this.trackHistoryChange('popstate');
    });
  }

  trackHistoryChange(type) {
    const historyData = {
      type: 'history_change',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      historyType: type,
      page: window.location.pathname,
      previousPage: this.navigationPath[this.navigationPath.length - 1]?.page?.path
    };

    this.sendAnalytics('history_change', historyData);
  }

  getCurrentSection() {
    // Determine current section based on URL or page content
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
      // For homepage, determine section by scroll position or hash
      const hash = window.location.hash;
      if (hash) {
        return hash.substring(1);
      }
      
      // Determine by scroll position
      const sections = ['hero', 'features', 'how-to', 'faq', 'download'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && this.isElementInViewport(element)) {
          return section;
        }
      }
      return 'homepage';
    }
    
    if (path.includes('/docs/')) {
      return path.split('/docs/')[1].split('/')[0] || 'docs';
    }
    
    return 'unknown';
  }

  isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.top <= window.innerHeight / 2;
  }

  isHomepage() {
    const path = window.location.pathname;
    return path === '/' || path === '/index.html';
  }

  isDocumentationPage() {
    return window.location.pathname.includes('/docs/');
  }

  sendAnalytics(eventType, data) {
    // Send to multiple analytics providers
    this.sendToGoogleAnalytics(eventType, data);
    this.sendToCustomAnalytics(eventType, data);
    this.logToConsole(eventType, data);
  }

  sendToGoogleAnalytics(eventType, data) {
    // Send to main analytics manager if available
    if (window.analyticsManager && window.analyticsManager.consentGiven) {
      // Dispatch custom event for main analytics to handle
      const customEvent = new CustomEvent('crossPageAnalytics', {
        detail: { eventType, data }
      });
      document.dispatchEvent(customEvent);
    }
    
    // Fallback to direct gtag if available
    if (typeof gtag === 'function') {
      gtag('event', eventType, {
        event_category: 'cross_page_integration',
        event_label: data.page || window.location.pathname,
        custom_map: {
          session_id: data.sessionId,
          page_type: data.page?.isHomepage ? 'homepage' : 'documentation'
        }
      });
    }
  }

  sendToCustomAnalytics(eventType, data) {
    // Store in localStorage for batch sending
    const analyticsQueue = JSON.parse(localStorage.getItem('analyticsQueue') || '[]');
    analyticsQueue.push({
      eventType,
      data,
      timestamp: Date.now()
    });
    
    // Keep only last 100 events to prevent storage overflow
    if (analyticsQueue.length > 100) {
      analyticsQueue.splice(0, analyticsQueue.length - 100);
    }
    
    localStorage.setItem('analyticsQueue', JSON.stringify(analyticsQueue));
    
    // Send to dashboard if available
    if (window.CrossPageIntegrationDashboard) {
      window.CrossPageIntegrationDashboard.processAnalyticsEvent({ eventType, data });
    }
    
    // Send batch if queue is large enough or enough time has passed
    this.processBatchAnalytics();
  }

  processBatchAnalytics() {
    const queue = JSON.parse(localStorage.getItem('analyticsQueue') || '[]');
    const lastSent = parseInt(localStorage.getItem('lastAnalyticsSent') || '0');
    const now = Date.now();
    
    // Send if queue has 10+ events or 5 minutes have passed
    if (queue.length >= 10 || (now - lastSent) > 300000) {
      this.sendBatchAnalytics(queue);
      localStorage.setItem('analyticsQueue', '[]');
      localStorage.setItem('lastAnalyticsSent', now.toString());
    }
  }

  sendBatchAnalytics(events) {
    // In a real implementation, this would send to your analytics endpoint
    console.log('📊 Sending batch analytics:', events.length, 'events');
    
    // Simulate API call
    if (navigator.sendBeacon) {
      const payload = JSON.stringify({
        batch: true,
        events: events,
        timestamp: Date.now()
      });
      navigator.sendBeacon('/analytics/batch', payload);
    }
  }

  logToConsole(eventType, data) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`📊 Analytics: ${eventType}`, data);
    }
  }

  // Public API for manual tracking
  trackCustomEvent(eventName, properties = {}) {
    const customData = {
      type: 'custom_event',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      eventName: eventName,
      properties: properties,
      page: window.location.pathname
    };

    this.sendAnalytics('custom_event', customData);
  }

  // Get analytics summary for debugging
  getAnalyticsSummary() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      timeOnSite: Date.now() - this.startTime,
      navigationPath: this.navigationPath,
      interactions: this.interactions.length,
      performanceMetrics: this.performanceMetrics,
      currentPage: window.location.pathname,
      currentSection: this.getCurrentSection()
    };
  }
}

// Initialize analytics when DOM is ready
let crossPageAnalytics;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    crossPageAnalytics = new CrossPageAnalytics();
    window.CrossPageAnalytics = crossPageAnalytics;
  });
} else {
  crossPageAnalytics = new CrossPageAnalytics();
  window.CrossPageAnalytics = crossPageAnalytics;
}

// Export for Node.js environments (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CrossPageAnalytics;
}