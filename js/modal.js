// Modal Functionality
(function() {
    'use strict';
    
    // Get modal elements
    const privacyModal = document.getElementById('privacy-modal');
    const accessibilityModal = document.getElementById('accessibility-modal');
    
    const privacyLink = document.getElementById('privacy-policy-link');
    const accessibilityLink = document.getElementById('accessibility-statement-link');
    
    // Function to open modal
    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Focus on close button for accessibility
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }
        
        // Trap focus within modal
        trapFocus(modal);
    }
    
    // Function to close modal
    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    // Close modal when clicking overlay
    function setupOverlayClose(modal) {
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => closeModal(modal));
        }
    }
    
    // Close modal when clicking close button
    function setupCloseButton(modal) {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modal));
        }
    }
    
    // Close modal on Escape key
    function setupEscapeKey(modal) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal(modal);
            }
        });
    }
    
    // Trap focus within modal for accessibility
    function trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
    }
    
    // Initialize modals
    if (privacyModal && privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(privacyModal);
        });
        setupOverlayClose(privacyModal);
        setupCloseButton(privacyModal);
        setupEscapeKey(privacyModal);
    }
    
    if (accessibilityModal && accessibilityLink) {
        accessibilityLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(accessibilityModal);
        });
        setupOverlayClose(accessibilityModal);
        setupCloseButton(accessibilityModal);
        setupEscapeKey(accessibilityModal);
    }
    
})();
