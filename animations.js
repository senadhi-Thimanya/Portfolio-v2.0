// animations.js - Main animation controller
class AnimationController {
    constructor() {
        this.animations = new Map();
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        this.initPhotoAnimations();
        this.initTitleAnimations();
        this.initMysteryQuestion();
        
        this.isInitialized = true;
        console.log('AnimationController initialized');
    }

    initPhotoAnimations() {
        const photos = document.querySelectorAll('.photo-container');
        
        photos.forEach((photo, index) => {
            // Add slight random delays to create organic movement
            const delay = Math.random() * 2;
            photo.style.animationDelay = `${delay}s`;
            
            // Add hover effects with random rotation
            photo.addEventListener('mouseenter', () => {
                const randomRotation = (Math.random() - 0.5) * 10; // -5 to 5 degrees
                photo.style.transform = `scale(1.05) rotate(${randomRotation}deg)`;
                photo.style.zIndex = '15';
            });
            
            photo.addEventListener('mouseleave', () => {
                photo.style.transform = '';
                photo.style.zIndex = '';
            });
            
            // Add click animation
            photo.addEventListener('click', () => {
                this.animatePhotoClick(photo);
            });
        });
    }

    animatePhotoClick(photo) {
        photo.style.animation = 'none';
        
        // Create a flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(212, 175, 55, 0.6);
            border-radius: 3px;
            animation: flashEffect 0.3s ease-out;
            pointer-events: none;
        `;
        
        photo.appendChild(flash);
        
        // Remove flash after animation
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
            photo.style.animation = ''; // Reset animation
        }, 300);
    }

    initTitleAnimations() {
        const title = document.querySelector('.main-title');
        if (title) {
            title.addEventListener('mouseenter', () => {
                title.style.animation = 'titleIntense 0.5s ease-in-out forwards';
            });
            
            title.addEventListener('mouseleave', () => {
                title.style.animation = 'titleGlow 3s ease-in-out infinite alternate';
            });
        }
    }

    initMysteryQuestion() {
        const question = document.querySelector('.mystery-question');
        if (question) {
            // Add typewriter effect on load
            const text = question.querySelector('h2');
            const originalText = text.textContent;
            text.textContent = '';
            
            let i = 0;
            const typeWriter = () => {
                if (i < originalText.length) {
                    text.textContent += originalText.charAt(i);
                    i++;
                    setTimeout(typeWriter, 150);
                }
            };
            
            // Start typewriter effect after a delay
            setTimeout(typeWriter, 2000);
            
            // Add click effect
            question.addEventListener('click', () => {
                question.style.animation = 'mysteryShake 0.5s ease-in-out';
                setTimeout(() => {
                    question.style.animation = 'mysteryPulse 2s ease-in-out infinite alternate';
                }, 500);
            });
        }
    }

    // Method to add custom animations
    addAnimation(name, element, keyframes, options = {}) {
        if (this.animations.has(name)) {
            this.animations.get(name).cancel();
        }
        
        const animation = element.animate(keyframes, {
            duration: options.duration || 1000,
            easing: options.easing || 'ease-in-out',
            iterations: options.iterations || 1,
            direction: options.direction || 'normal',
            fill: options.fill || 'both'
        });
        
        this.animations.set(name, animation);
        return animation;
    }

    // Stop all animations
    stopAll() {
        this.animations.forEach(animation => {
            animation.cancel();
        });
        this.animations.clear();
    }
}

// Add additional CSS keyframes dynamically
const additionalStyles = `
    @keyframes flashEffect {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
    
    @keyframes titleIntense {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    @keyframes mysteryShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Export for use in main.js
window.AnimationController = AnimationController;