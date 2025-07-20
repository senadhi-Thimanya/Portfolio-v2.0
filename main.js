// main.js - Main application controller
class MysteryBoard {
    constructor() {
        this.animationController = null;
        this.particleSystem = null;
        this.photoManager = null;
        this.connectionLines = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        console.log('Initializing Mystery Board...');
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeModules());
        } else {
            this.initializeModules();
        }
    }

    initializeModules() {
        try {
            // Initialize all modules
            this.animationController = new window.AnimationController();
            this.particleSystem = new window.ParticleSystem();
            this.photoManager = new window.PhotoManager();
            this.connectionLines = new window.ConnectionLines();

            // Initialize each module
            this.animationController.init();
            this.particleSystem.init();
            this.photoManager.init();
            this.connectionLines.init();

            // Setup global interactions
            this.setupGlobalEvents();
            this.setupKeyboardShortcuts();
            
            this.isInitialized = true;
            console.log('Mystery Board initialized successfully!');
            
            // Show welcome message
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Error initializing Mystery Board:', error);
        }
    }

    setupGlobalEvents() {
        // Add click effects to photos that trigger particle bursts
        document.querySelectorAll('.photo-container').forEach(photo => {
            photo.addEventListener('click', (e) => {
                const rect = photo.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Create particle burst at photo location
                this.particleSystem.createBurst(centerX, centerY, 8);
            });
        });

        // Add special effects to mystery question
        const mysteryQuestion = document.querySelector('.mystery-question');
        if (mysteryQuestion) {
            mysteryQuestion.addEventListener('click', () => {
                this.triggerMysteryEffect();
            });
        }

        // Add atmospheric dust motes periodically
        setInterval(() => {
            this.particleSystem.createDustMotes();
        }, 30000); // Every 30 seconds

        // Handle visibility change (pause/resume animations when tab not visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + R: Reset all photos
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.photoManager.resetAllPhotos();
            }
            
            // Ctrl/Cmd + I: Toggle interactive mode
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                this.connectionLines.toggleInteractiveMode();
            }
            
            // Space: Trigger mystery effect
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                this.triggerMysteryEffect();
            }
            
            // Numbers 1-6: Select photos quickly
            if (e.key >= '1' && e.key <= '6') {
                const photoSelect = document.getElementById('photoSelect');
                if (photoSelect) {
                    photoSelect.value = `photo${e.key}`;
                    photoSelect.dispatchEvent(new Event('change'));
                }
            }
            
            // Escape: Clear all effects
            if (e.key === 'Escape') {
                this.clearAllEffects();
            }
        });
    }

    triggerMysteryEffect() {
        // Create dramatic effect for the mystery question
        const question = document.querySelector('.mystery-question');
        if (!question) return;

        // Screen flash
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(0, 0, 0, 0.8) 70%);
            z-index: 9999;
            pointer-events: none;
            animation: mysteryFlash 1.5s ease-out;
        `;
        
        document.body.appendChild(flash);
        
        // Lightning effect on all connections
        this.connectionLines.connections.forEach((connectionData) => {
            const line = connectionData.line;
            line.style.animation = 'lightningFlash 1s ease-out';
            line.style.stroke = '#d4af37';
            line.style.filter = 'drop-shadow(0 0 15px #d4af37)';
            
            setTimeout(() => {
                line.style.animation = '';
                line.style.stroke = connectionData.color;
                line.style.filter = `drop-shadow(0 0 5px ${connectionData.color})`;
            }, 1000);
        });

        // Particle burst from question
        const rect = question.getBoundingClientRect();
        this.particleSystem.createBurst(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            12
        );

        // Remove flash after animation
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 1500);
    }

    clearAllEffects() {
        // Stop particle animations
        if (this.particleSystem) {
            this.particleSystem.stop();
            setTimeout(() => this.particleSystem.start(), 100);
        }

        // Reset connection lines
        if (this.connectionLines) {
            this.connectionLines.resetConnectionHighlights();
        }

        // Clear any mystery effects
        const flashes = document.querySelectorAll('div[style*="mysteryFlash"]');
        flashes.forEach(flash => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        });

        // Reset any highlighted photos
        document.querySelectorAll('.photo-container').forEach(photo => {
            photo.style.transform = '';
            photo.style.zIndex = '';
        });
    }

    pauseAnimations() {
        // Pause particle system
        if (this.particleSystem) {
            this.particleSystem.stop();
        }

        // Pause photo animations
        document.querySelectorAll('.photo-container').forEach(photo => {
            photo.style.animationPlayState = 'paused';
        });

        // Pause connection line animations
        document.querySelectorAll('.connection-line').forEach(line => {
            line.style.animationPlayState = 'paused';
        });

        // Pause mystery question animation
        const question = document.querySelector('.mystery-question');
        if (question) {
            question.style.animationPlayState = 'paused';
        }
    }

    resumeAnimations() {
        // Resume particle system
        if (this.particleSystem) {
            this.particleSystem.start();
        }

        // Resume photo animations
        document.querySelectorAll('.photo-container').forEach(photo => {
            photo.style.animationPlayState = 'running';
        });

        // Resume connection line animations
        document.querySelectorAll('.connection-line').forEach(line => {
            line.style.animationPlayState = 'running';
        });

        // Resume mystery question animation
        const question = document.querySelector('.mystery-question');
        if (question) {
            question.style.animationPlayState = 'running';
        }
    }

    showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: var(--accent-gold);
            padding: 30px 50px;
            border-radius: 10px;
            text-align: center;
            z-index: 10000;
            border: 2px solid var(--accent-gold);
            box-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
            backdrop-filter: blur(10px);
            animation: welcomeFade 3s ease-out forwards;
        `;

        welcome.innerHTML = `
            <h2 style="font-family: 'Nosifer', cursive; margin-bottom: 15px;">Welcome Detective</h2>
            <p style="color: #ccc; margin-bottom: 20px;">Investigate the evidence and solve the mystery.</p>
            <div style="font-style: italic; color: #888;">
                Press Space to reveal connections<br>
                Ctrl/Cmd + I for interactive mode<br>
                Ctrl/Cmd + R to reset photos<br>
                Esc to clear effects
            </div>
        `;

        document.body.appendChild(welcome);

        // Add welcome animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes welcomeFade {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            }
            
            @keyframes mysteryFlash {
                0% { opacity: 0; transform: scale(1.1); }
                50% { opacity: 1; transform: scale(1); }
                100% { opacity: 0; transform: scale(0.9); }
            }
            
            @keyframes lightningFlash {
                0% { stroke-width: 2; opacity: 0.7; }
                50% { stroke-width: 4; opacity: 1; }
                100% { stroke-width: 2; opacity: 0.7; }
            }
        `;
        document.head.appendChild(style);

        // Remove welcome message after animation
        setTimeout(() => {
            if (welcome.parentNode) {
                welcome.parentNode.removeChild(welcome);
            }
        }, 3000);
    }
}

// Initialize the application
const mysteryBoard = new MysteryBoard();
mysteryBoard.init();