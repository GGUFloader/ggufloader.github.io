module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:8080/',
        'http://localhost:8080/docs/',
        'http://localhost:8080/docs/installation/',
        'http://localhost:8080/docs/quick-start/',
        'http://localhost:8080/docs/addon-development/',
        'http://localhost:8080/docs/addon-api/',
        'http://localhost:8080/docs/smart-floater-example/',
        'http://localhost:8080/docs/package-structure/'
      ],
      startServerCommand: 'npm run serve',
      startServerReadyPattern: 'Serving HTTP',
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless',
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: [
          'canonical', // We handle this in our custom SEO validation
          'meta-description' // We handle this in our custom SEO validation
        ]
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Core Web Vitals
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'first-input-delay': ['warn', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],
        
        // Performance metrics
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
        
        // SEO requirements
        'document-title': 'error',
        'meta-description': 'error',
        'http-status-code': 'error',
        'crawlable-anchors': 'error',
        'is-crawlable': 'error',
        'robots-txt': 'warn',
        
        // Accessibility requirements
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'list': 'error',
        'meta-viewport': 'error',
        
        // Best practices
        'uses-https': 'error',
        'uses-http2': 'warn',
        'no-vulnerable-libraries': 'error'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};