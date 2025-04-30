document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    const mainContent = document.querySelector('.main-content');
    const navButtons = document.querySelectorAll('.sidebar-menu button');
    let isNavigating = false;

    // Make showSection available globally
    window.showSection = function(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.add('hidden-section');
            section.classList.remove('active-section');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden-section');
            targetSection.classList.add('active-section');
        }

        // Update active state of buttons
        navButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`button[data-section="${sectionId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Close mobile menu if on mobile
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    };

    function toggleMobileMenu(e) {
        if (e) e.stopPropagation();
        console.log('Toggle mobile menu called'); // Debug log
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        mainContent.classList.toggle('sidebar-active');
        
        // Toggle aria-expanded for accessibility
        const isExpanded = sidebar.classList.contains('active');
        mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
    }

    function closeMobileMenu() {
        console.log('Close mobile menu called'); // Debug log
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        mainContent.classList.remove('sidebar-active');
        mobileMenuBtn.setAttribute('aria-expanded', false);
    }

    // Handle mobile menu button click
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Handle overlay click
    overlay.addEventListener('click', closeMobileMenu);

    // Handle navigation button clicks
    navButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            // Prevent multiple clicks while navigating
            if (isNavigating) return;
            isNavigating = true;

            const section = this.getAttribute('data-section');
            if (section) {
                window.showSection(section);
            }

            // Reset navigation flag
            setTimeout(() => {
                isNavigating = false;
            }, 300);
        });
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Handle touch events for better mobile experience
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;

    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diff = touchEndX - touchStartX;

        // Swipe right to open menu (when near left edge)
        if (diff > swipeThreshold && !sidebar.classList.contains('active') && touchStartX < 50) {
            toggleMobileMenu();
        }
        // Swipe left to close menu
        else if (diff < -swipeThreshold && sidebar.classList.contains('active')) {
            closeMobileMenu();
        }
    }

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
                closeMobileMenu();
            }
        }, 250);
    });

    // Debug check for elements
    console.log('Mobile menu button:', mobileMenuBtn);
    console.log('Sidebar:', sidebar);
    console.log('Overlay:', overlay);
}); 