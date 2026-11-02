/**
 * Feature Flags for Homepage-Subpage Integration
 * Controls gradual rollout of integration features
 */

window.FeatureFlags = window.FeatureFlags || {};

// Phase 1: Basic Cross-Page Linking (Deployed)
window.FeatureFlags.homepageIntegrationPhase1 = {
  enabled: true,
  rolloutPercentage: 100,
  lastUpdated: "2025-01-27T10:00:00.000Z",
  features: {
    contextualLinks: true,
    breadcrumbNavigation: true,
    basicNavigationEnhancement: true
  }
};

// Phase 2: Content Preview System (Ready for gradual rollout)
window.FeatureFlags.homepageIntegrationPhase2 = {
  enabled: false,
  rolloutPercentage: 0,
  lastUpdated: "2025-01-27T10:00:00.000Z",
  features: {
    contentPreviewComponents: false,
    documentationTeasers: false,
    contentSynchronization: false
  }
};

// Phase 3: Advanced Features (Pending)
window.FeatureFlags.homepageIntegrationPhase3 = {
  enabled: false,
  rolloutPercentage: 0,
  lastUpdated: "2025-01-27T10:00:00.000Z",
  features: {
    relatedContentSuggestions: false,
    userJourneyOptimization: false,
    advancedAnalytics: false
  }
};

/**
 * Feature Flag Utilities
 */
window.FeatureFlags.utils = {
  /**
   * Check if a feature is enabled for the current user
   * @param {string} flagName - Name of the feature flag
   * @returns {boolean} - Whether the feature is enabled
   */
  isEnabled: function(flagName) {
    const flag = window.FeatureFlags[flagName];
    if (!flag || !flag.enabled) {
      return false;
    }
    
    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      // Use a consistent hash based on user session or browser fingerprint
      const userHash = this.getUserHash();
      const userPercentile = userHash % 100;
      return userPercentile < flag.rolloutPercentage;
    }
    
    return true;
  },
  
  /**
   * Check if a specific feature within a phase is enabled
   * @param {string} phase - Phase name (e.g., 'homepageIntegrationPhase1')
   * @param {string} feature - Feature name within the phase
   * @returns {boolean} - Whether the specific feature is enabled
   */
  isFeatureEnabled: function(phase, feature) {
    if (!this.isEnabled(phase)) {
      return false;
    }
    
    const flag = window.FeatureFlags[phase];
    return flag.features && flag.features[feature] === true;
  },
  
  /**
   * Get user hash for consistent rollout percentage calculation
   * @returns {number} - Hash value for the current user
   */
  getUserHash: function() {
    // Use sessionStorage to maintain consistency within a session
    let userHash = sessionStorage.getItem('featureFlagUserHash');
    
    if (!userHash) {
      // Generate a simple hash based on browser characteristics
      const navigator = window.navigator;
      const screen = window.screen;
      const hashString = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        new Date().getDate() // Changes daily for gradual rollout
      ].join('|');
      
      // Simple hash function
      let hash = 0;
      for (let i = 0; i < hashString.length; i++) {
        const char = hashString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      userHash = Math.abs(hash);
      sessionStorage.setItem('featureFlagUserHash', userHash.toString());
    }
    
    return parseInt(userHash);
  },
  
  /**
   * Log feature flag usage for analytics
   * @param {string} flagName - Name of the feature flag
   * @param {string} action - Action taken (e.g., 'enabled', 'disabled', 'used')
   */
  logUsage: function(flagName, action) {
    if (window.analytics && typeof window.analytics.track === 'function') {
      window.analytics.track('Feature Flag Usage', {
        flag: flagName,
        action: action,
        timestamp: new Date().toISOString(),
        userHash: this.getUserHash()
      });
    }
  },
  
  /**
   * Initialize feature flags and apply them to the page
   */
  initialize: function() {
    console.log('🚀 Initializing feature flags...');
    
    // Apply Phase 1 features
    if (this.isEnabled('homepageIntegrationPhase1')) {
      this.enablePhase1Features();
      this.logUsage('homepageIntegrationPhase1', 'enabled');
    }
    
    // Apply Phase 2 features
    if (this.isEnabled('homepageIntegrationPhase2')) {
      this.enablePhase2Features();
      this.logUsage('homepageIntegrationPhase2', 'enabled');
    }
    
    // Apply Phase 3 features
    if (this.isEnabled('homepageIntegrationPhase3')) {
      this.enablePhase3Features();
      this.logUsage('homepageIntegrationPhase3', 'enabled');
    }
    
    console.log('✅ Feature flags initialized');
  },
  
  /**
   * Enable Phase 1 features: Basic Cross-Page Linking
   */
  enablePhase1Features: function() {
    console.log('🔗 Enabling Phase 1: Basic Cross-Page Linking');
    
    // Enable contextual links
    if (this.isFeatureEnabled('homepageIntegrationPhase1', 'contextualLinks')) {
      document.body.classList.add('feature-contextual-links');
    }
    
    // Enable breadcrumb navigation
    if (this.isFeatureEnabled('homepageIntegrationPhase1', 'breadcrumbNavigation')) {
      document.body.classList.add('feature-breadcrumb-nav');
    }
    
    // Enable basic navigation enhancement
    if (this.isFeatureEnabled('homepageIntegrationPhase1', 'basicNavigationEnhancement')) {
      document.body.classList.add('feature-enhanced-nav');
    }
  },
  
  /**
   * Enable Phase 2 features: Content Preview System
   */
  enablePhase2Features: function() {
    console.log('📖 Enabling Phase 2: Content Preview System');
    
    // Enable content preview components
    if (this.isFeatureEnabled('homepageIntegrationPhase2', 'contentPreviewComponents')) {
      document.body.classList.add('feature-content-preview');
      
      // Load content preview system
      if (typeof window.ContentPreviewSystem !== 'undefined') {
        window.ContentPreviewSystem.initialize();
      }
    }
    
    // Enable documentation teasers
    if (this.isFeatureEnabled('homepageIntegrationPhase2', 'documentationTeasers')) {
      document.body.classList.add('feature-doc-teasers');
    }
    
    // Enable content synchronization
    if (this.isFeatureEnabled('homepageIntegrationPhase2', 'contentSynchronization')) {
      document.body.classList.add('feature-content-sync');
      
      // Load content synchronization system
      if (typeof window.ContentSynchronization !== 'undefined') {
        window.ContentSynchronization.initialize();
      }
    }
  },
  
  /**
   * Enable Phase 3 features: Advanced Features
   */
  enablePhase3Features: function() {
    console.log('🚀 Enabling Phase 3: Advanced Features');
    
    // Enable related content suggestions
    if (this.isFeatureEnabled('homepageIntegrationPhase3', 'relatedContentSuggestions')) {
      document.body.classList.add('feature-related-content');
      
      // Load related content system
      if (typeof window.RelatedContentSystem !== 'undefined') {
        window.RelatedContentSystem.initialize();
      }
    }
    
    // Enable user journey optimization
    if (this.isFeatureEnabled('homepageIntegrationPhase3', 'userJourneyOptimization')) {
      document.body.classList.add('feature-journey-optimization');
      
      // Load user journey optimizer
      if (typeof window.UserJourneyOptimizer !== 'undefined') {
        window.UserJourneyOptimizer.initialize();
      }
    }
    
    // Enable advanced analytics
    if (this.isFeatureEnabled('homepageIntegrationPhase3', 'advancedAnalytics')) {
      document.body.classList.add('feature-advanced-analytics');
      
      // Initialize advanced user behavior tracking
      if (typeof window.UserBehaviorTracker !== 'undefined') {
        window.UserBehaviorTracker.enableAdvancedTracking();
      }
    }
  }
};

/**
 * Auto-initialize feature flags when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    window.FeatureFlags.utils.initialize();
  });
} else {
  window.FeatureFlags.utils.initialize();
}

/**
 * Expose feature flag status for debugging
 */
window.FeatureFlags.debug = {
  getAllFlags: function() {
    const flags = {};
    for (const [key, value] of Object.entries(window.FeatureFlags)) {
      if (key !== 'utils' && key !== 'debug' && typeof value === 'object') {
        flags[key] = {
          enabled: window.FeatureFlags.utils.isEnabled(key),
          config: value
        };
      }
    }
    return flags;
  },
  
  logStatus: function() {
    console.table(this.getAllFlags());
  }
};

// Export for Node.js environments (testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.FeatureFlags;
}