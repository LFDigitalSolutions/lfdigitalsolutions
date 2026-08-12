// Navigation System Module

class NavigationSystem {
  constructor() {
    this.navLinks = document.querySelectorAll('.nav-link');
    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.nav-menu');
    this.sections = document.querySelectorAll('section[id]');
    this.navOverlay = null;
    
    this.init();
  }
  
  init() {
    // Create mobile menu overlay
    this.createOverlay();
    
    // Set up event listeners
    this.setupNavigationListeners();
    this.setupMobileMenuToggle();
    this.setupHashNavigation();
    this.setupIntersectionObserver();
    
    // Handle initial page load with hash
    if (window.location.hash) {
      setTimeout(() => this.scrollToSection(window.location.hash.substring(1)), 100);
    }
  }
  
  createOverlay() {
    this.navOverlay = document.createElement('div');
    this.navOverlay.className = 'nav-overlay';
    this.navOverlay.addEventListener('click', () => this.closeMobileMenu());
    document.body.appendChild(this.navOverlay);
  }
  
  setupNavigationListeners() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        this.scrollToSection(targetId);
        this.closeMobileMenu();
        
        // Track navigation click in analytics
        if (window.gtag) {
          gtag('event', 'nav_click', {
            event_category: 'navigation',
            event_label: targetId
          });
        }
      });
    });
  }
  
  setupMobileMenuToggle() {
    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => {
        this.toggleMobileMenu();
      });
      
      // Close menu on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.navMenu.classList.contains('active')) {
          this.closeMobileMenu();
        }
      });
    }
  }
  
  toggleMobileMenu() {
    const isExpanded = this.hamburger.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }
  
  openMobileMenu() {
    this.navMenu.classList.add('active');
    this.navOverlay.classList.add('active');
    this.hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
  }
  
  closeMobileMenu() {
    this.navMenu.classList.remove('active');
    this.navOverlay.classList.remove('active');
    this.hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = ''; // Restore scrolling
  }
  
  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    
    if (section) {
      // Get the navigation height to offset the scroll
      const nav = document.querySelector('.main-nav');
      const navHeight = nav ? nav.offsetHeight : 0;
      
      // Calculate the position to scroll to
      const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - navHeight;
      
      // Smooth scroll using window.scrollTo for better browser compatibility
      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      });
      
      // Update URL hash without triggering scroll
      history.pushState(null, null, `#${sectionId}`);
      
      // Update active link
      this.updateActiveLink(sectionId);
    }
  }
  
  setupHashNavigation() {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      if (window.location.hash) {
        const sectionId = window.location.hash.substring(1);
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }
  
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '-100px 0px -50% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.updateActiveLink(entry.target.id);
          
          // Update URL hash without scrolling
          if (entry.target.id !== 'home') {
            history.replaceState(null, null, `#${entry.target.id}`);
          } else {
            history.replaceState(null, null, window.location.pathname);
          }
        }
      });
    }, options);
    
    this.sections.forEach(section => observer.observe(section));
  }
  
  updateActiveLink(sectionId) {
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${sectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

// Initialize navigation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NavigationSystem();
  });
} else {
  new NavigationSystem();
}

