// Analytics Module

class Analytics {
  constructor() {
    this.trackingEnabled = this.checkConsent();
    this.sections = document.querySelectorAll('section[id]');
    
    if (this.trackingEnabled) {
      this.init();
    }
  }
  
  init() {
    this.setupSectionTracking();
    this.trackPageView();
  }
  
  checkConsent() {
    // Check if user has given consent
    // For now, we'll default to enabled, but you should implement proper consent management
    const consent = localStorage.getItem('analytics-consent');
    return consent !== 'false';
  }
  
  trackPageView() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }
  
  setupSectionTracking() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5 // Track when 50% of section is visible
    };
    
    const trackedSections = new Set();
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !trackedSections.has(entry.target.id)) {
          this.trackSectionView(entry.target.id);
          trackedSections.add(entry.target.id);
        }
      });
    }, options);
    
    this.sections.forEach(section => observer.observe(section));
  }
  
  trackSectionView(sectionId) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'section_view', {
        event_category: 'navigation',
        event_label: sectionId
      });
    }
  }
  
  trackEvent(eventName, eventCategory, eventLabel, eventValue) {
    if (this.trackingEnabled && typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: eventCategory,
        event_label: eventLabel,
        value: eventValue
      });
    }
  }
  
  setConsent(hasConsent) {
    localStorage.setItem('analytics-consent', hasConsent ? 'true' : 'false');
    this.trackingEnabled = hasConsent;
    
    if (hasConsent) {
      this.init();
    }
  }
}

// Initialize analytics when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new Analytics();
  });
} else {
  window.analytics = new Analytics();
}

