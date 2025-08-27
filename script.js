// Mobile menu functionality
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const content = document.getElementById('content');

function toggleMobileMenu() {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');

    // Update menu icon
    const icon = mobileMenuToggle.querySelector('i');
    if (sidebar.classList.contains('active')) {
        icon.className = 'ri-close-line';
    } else {
        icon.className = 'ri-menu-line';
    }
}

function closeMobileMenu() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    mobileMenuToggle.querySelector('i').className = 'ri-menu-line';
}

mobileMenuToggle.addEventListener('click', toggleMobileMenu);
sidebarOverlay.addEventListener('click', closeMobileMenu);

// Close mobile menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        closeMobileMenu();
    }
});

/* Sidebar highlight and navigation */
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        document.getElementById(item.dataset.target).scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        // Close mobile menu after navigation
        if (window.innerWidth <= 768) {
            closeMobileMenu();
        }
    });

    // Keyboard navigation
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
        }
    });
});

// Update active navigation on scroll
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
            current = sec.id;
        }
    });
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.target === current);
    });
});

/* Motion slider functionality */
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const copyBtn = document.getElementById('copyBtn');
const progressBar = document.getElementById('progressBar');

let currentSlide = 0;
let isPlaying = true;
let slideTimer = null;
let tickStart = null;
const SLIDE_DURATION = 4000;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('visible', i === index);
    });
    currentSlide = index;
}

function nextSlide() {
    showSlide((currentSlide + 1) % slides.length);
}

function prevSlide() {
    showSlide((currentSlide - 1 + slides.length) % slides.length);
}

function startSlideshow() {
    stopSlideshow();
    isPlaying = true;
    playIcon.className = 'ri-pause-fill';
    playBtn.querySelector('span').textContent = 'Pause';
    tickStart = performance.now();
    slideTimer = setInterval(() => {
        nextSlide();
        tickStart = performance.now();
    }, SLIDE_DURATION);
    requestAnimationFrame(updateProgress);
}

function stopSlideshow() {
    isPlaying = false;
    playIcon.className = 'ri-play-fill';
    playBtn.querySelector('span').textContent = 'Play';
    if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = null;
    }
}

function togglePlayback() {
    if (isPlaying) {
        stopSlideshow();
    } else {
        startSlideshow();
    }
}

function updateProgress(timestamp) {
    if (!tickStart || !isPlaying) return;

    const elapsed = timestamp - tickStart;
    const percentage = Math.min(100, (elapsed / SLIDE_DURATION) * 100);
    progressBar.style.width = percentage + '%';

    if (isPlaying) {
        requestAnimationFrame(updateProgress);
    }
}

// Event listeners for slider controls
prevBtn.addEventListener('click', () => {
    prevSlide();
    stopSlideshow();
});

nextBtn.addEventListener('click', () => {
    nextSlide();
    stopSlideshow();
});

playBtn.addEventListener('click', togglePlayback);

// Copy functionality
copyBtn.addEventListener('click', async () => {
    const allText = Array.from(slides).map(slide => slide.innerText.trim()).join('\n\n');

    try {
        await navigator.clipboard.writeText(allText);
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="ri-check-line"></i><span>Copied!</span>';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    } catch (error) {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = allText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="ri-check-line"></i><span>Copied!</span>';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        } catch (fallbackError) {
            console.error('Copy failed:', fallbackError);
        }
        document.body.removeChild(textArea);
    }
});

// Keyboard controls for slideshow
document.addEventListener('keydown', (e) => {
    // Only handle keyboard events when not typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            prevSlide();
            stopSlideshow();
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextSlide();
            stopSlideshow();
            break;
        case ' ':
            e.preventDefault();
            togglePlayback();
            break;
    }
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;
const minSwipeDistance = 50;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
            // Swipe right - previous slide
            prevSlide();
            stopSlideshow();
        } else {
            // Swipe left - next slide
            nextSlide();
            stopSlideshow();
        }
    }
}

// Pause slideshow when tab is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (isPlaying) {
            stopSlideshow();
            // Mark that it was auto-paused
            playBtn.dataset.autoPaused = 'true';
        }
    } else {
        // Resume if it was auto-paused
        if (playBtn.dataset.autoPaused === 'true') {
            startSlideshow();
            delete playBtn.dataset.autoPaused;
        }
    }
});

// Responsive behavior
function handleResize() {
    // Adjust slideshow behavior based on screen size
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // On mobile, make controls more touch-friendly
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
        // Close mobile menu when resizing to desktop
        closeMobileMenu();
    }
}

window.addEventListener('resize', handleResize);

// Initialize
showSlide(0);
startSlideshow();
handleResize();

// Intersection Observer for better scroll performance
const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            navItems.forEach(item => {
                item.classList.toggle('active', item.dataset.target === sectionId);
            });
        }
    });
}, observerOptions);

// Observe all sections
sections.forEach(section => {
    sectionObserver.observe(section);
});

// Add loading states and error handling
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Handle reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    stopSlideshow();
}

prefersReducedMotion.addListener((mediaQuery) => {
    if (mediaQuery.matches) {
        stopSlideshow();
    }
});
