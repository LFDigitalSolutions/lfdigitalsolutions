// Animation System Module

class AnimationSystem {
  constructor() {
    this.animatedElements = document.querySelectorAll('.animate-on-scroll');
    this.init();
  }
  
  init() {
    if (!this.shouldAnimate()) {
      // If user prefers reduced motion, make all elements visible immediately
      this.animatedElements.forEach(el => {
        el.style.opacity = '1';
      });
      return;
    }
    
    this.setupIntersectionObserver();
  }
  
  shouldAnimate() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !prefersReducedMotion;
  }
  
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2 // Trigger when 20% of element is visible
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, options);
    
    this.animatedElements.forEach(el => {
      // Add will-change for GPU acceleration
      el.style.willChange = 'transform, opacity';
      observer.observe(el);
    });
  }
  
  animateElement(element) {
    // Add visible class to trigger animation
    element.classList.add('visible');
    
    // Remove will-change after animation completes for better performance
    element.addEventListener('animationend', () => {
      element.style.willChange = 'auto';
      element.classList.add('animation-complete');
    }, { once: true });
  }
}

// Initialize animation system when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new AnimationSystem();
  });
} else {
  new AnimationSystem();
}

