// Istanbul Travel Guide JavaScript

class TravelGuide {
    constructor() {
        this.currentScreen = 'home';
        this.menuOpen = false;
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.setupKeyboardNavigation();
        this.setupSwipeGestures();
        this.initLazyLoading();
    }

    // Event Listeners
    bindEventListeners() {
        // Menu buttons
        const menuBtn = document.getElementById('menuBtn');
        const closeMenuBtn = document.getElementById('closeMenuBtn');
        const menuOverlay = document.getElementById('menuOverlay');

        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.toggleMenu());
        }

        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', () => this.toggleMenu());
        }

        // Close menu when clicking outside
        if (menuOverlay) {
            menuOverlay.addEventListener('click', (e) => {
                if (e.target === menuOverlay) {
                    this.toggleMenu();
                }
            });
        }

        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.screen) {
                this.showScreen(e.state.screen, false);
            }
        });
    }

    // Screen Navigation
    showScreen(screenId, addToHistory = true) {
        // Validate screen exists
        const targetScreen = document.getElementById(screenId);
        if (!targetScreen) {
            console.error(`Screen with id "${screenId}" not found`);
            return;
        }

        // Hide all screens
        const allScreens = document.querySelectorAll('#app > div');
        allScreens.forEach(screen => {
            screen.classList.add('hidden');
        });

        // Show target screen with fade effect
        targetScreen.classList.remove('hidden');
        
        // Add fade-in animation
        targetScreen.style.opacity = '0';
        requestAnimationFrame(() => {
            targetScreen.style.transition = 'opacity 0.3s ease';
            targetScreen.style.opacity = '1';
        });

        // Update current screen
        this.currentScreen = screenId;

        // Close menu if open
        if (this.menuOpen) {
            this.toggleMenu();
        }

        // Scroll to top smoothly
        this.scrollToTop();

        // Add to browser history
        if (addToHistory) {
            history.pushState({ screen: screenId }, '', `#${screenId}`);
        }

        // Update page title
        this.updatePageTitle(screenId);

        // Trigger lazy loading for images in the new screen
        this.loadImagesInScreen(screenId);
    }

    // Menu Toggle
    toggleMenu() {
        const menuOverlay = document.getElementById('menuOverlay');
        if (!menuOverlay) return;

        this.menuOpen = !this.menuOpen;
        
        if (this.menuOpen) {
            menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            menuOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    // Utility Functions
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    updatePageTitle(screenId) {
        const titles = {
            'home': 'Road Istanbul 3.8-10.8',
            'plan': 'Travel Plan - Road Istanbul',
            'day1': 'Day 1 - Monday - Road Istanbul',
            'day2': 'Day 2 - Tuesday - Road Istanbul',
            'day3': 'Day 3 - Wednesday - Road Istanbul',
            'day4': 'Day 4 - Thursday - Road Istanbul',
            'day5': 'Day 5 - Friday - Road Istanbul',
            'day6': 'Day 6 - Saturday - Road Istanbul',
            'day7': 'Day 7 - Sunday - Road Istanbul'
        };

        document.title = titles[screenId] || 'Road Istanbul 3.8-10.8';
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC key to close menu or go back
            if (e.key === 'Escape') {
                if (this.menuOpen) {
                    this.toggleMenu();
                } else if (this.currentScreen !== 'home') {
                    this.goBack();
                }
            }

            // Arrow keys for day navigation
            if (this.currentScreen.startsWith('day')) {
                const dayNumber = parseInt(this.currentScreen.replace('day', ''));
                
                if (e.key === 'ArrowLeft' && dayNumber > 1) {
                    this.showScreen(`day${dayNumber - 1}`);
                } else if (e.key === 'ArrowRight' && dayNumber < 7) {
                    this.showScreen(`day${dayNumber + 1}`);
                }
            }

            // 'H' key to go home
            if (e.key === 'h' || e.key === 'H') {
                if (!this.menuOpen) {
                    this.showScreen('home');
                }
            }

            // 'M' key to toggle menu
            if (e.key === 'm' || e.key === 'M') {
                this.toggleMenu();
            }
        });
    }

    // Touch/Swipe Gestures
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe();
        });

        const handleSwipe = () => {
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 100;

            // Horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (this.currentScreen.startsWith('day')) {
                    const dayNumber = parseInt(this.currentScreen.replace('day', ''));
                    
                    if (deltaX > 0 && dayNumber > 1) {
                        // Swipe right - go to previous day
                        this.showScreen(`day${dayNumber - 1}`);
                    } else if (deltaX < 0 && dayNumber < 7) {
                        // Swipe left - go to next day
                        this.showScreen(`day${dayNumber + 1}`);
                    }
                }
            }

            // Vertical swipe down to close menu
            if (deltaY > minSwipeDistance && this.menuOpen) {
                this.toggleMenu();
            }
        };

        this.handleSwipe = handleSwipe;
    }

    // Lazy Loading for Images
    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    loadImagesInScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (!screen) return;

        const images = screen.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete && img.naturalHeight === 0) {
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.onload = function() {
                    this.style.opacity = '1';
                };
            }
        });
    }

    // Navigation Helpers
    goBack() {
        const backNavigation = {
            'plan': 'home',
            'day1': 'plan',
            'day2': 'plan',
            'day3': 'plan',
            'day4': 'plan',
            'day5': 'plan',
            'day6': 'plan',
            'day7': 'plan'
        };

        const backScreen = backNavigation[this.currentScreen];
        if (backScreen) {
            this.showScreen(backScreen);
        }
    }

    // Handle Window Resize
    handleResize() {
        // Close menu on larger screens
        if (window.innerWidth > 768 && this.menuOpen) {
            this.toggleMenu();
        }

        // Adjust photo frame sizes on very small screens
        if (window.innerWidth < 360) {
            document.documentElement.style.setProperty('--photo-height', '140px');
        } else {
            document.documentElement.style.setProperty('--photo-height', '200px');
        }
    }

    // Debounce utility
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public Methods for HTML onclick handlers
    static showScreen(screenId) {
        if (window.travelGuide) {
            window.travelGuide.showScreen(screenId);
        }
    }

    static toggleMenu() {
        if (window.travelGuide) {
            window.travelGuide.toggleMenu();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.travelGuide = new TravelGuide();
    
    // Set initial screen based on URL hash
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
        window.travelGuide.showScreen(hash, false);
    }
});

// Global functions for HTML onclick handlers
function showScreen(screenId) {
    TravelGuide.showScreen(screenId);
}

function toggleMenu() {
    TravelGuide.toggleMenu();
}

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Performance monitoring
window.addEventListener('load', () => {
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);
    }
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // You could send this to an error reporting service
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});
