// particles.js - Atmospheric particle system
class ParticleSystem {
    constructor() {
        this.container = null;
        this.particles = [];
        this.isRunning = false;
        this.particleCount = 15;
        this.colors = ['#d4af37', '#8b0000', '#ffffff', '#cccccc'];
    }

    init() {
        this.container = document.getElementById('particles');
        if (!this.container) {
            console.error('Particles container not found');
            return;
        }
        
        this.createInitialParticles();
        this.start();
        console.log('ParticleSystem initialized');
    }

    createInitialParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            setTimeout(() => {
                this.createParticle();
            }, i * 200); // Stagger initial particle creation
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 4 + 1; // 1-5px
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const opacity = Math.random() * 0.3 + 0.1; // 0.1-0.4
        const duration = Math.random() * 10 + 8; // 8-18 seconds
        const startX = Math.random() * window.innerWidth;
        const endX = startX + (Math.random() - 0.5) * 200; // Slight horizontal drift
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${startX}px;
            opacity: ${opacity};
            animation: particleFloat ${duration}s linear infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        
        // Custom animation for this particle
        particle.style.setProperty('--end-x', `${endX}px`);
        
        this.container.appendChild(particle);
        this.particles.push(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            this.removeParticle(particle);
        }, (duration + 2) * 1000);
    }

    removeParticle(particle) {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
        }
        
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        // Continuously create new particles
        this.intervalId = setInterval(() => {
            if (this.particles.length < this.particleCount * 2) {
                this.createParticle();
            }
        }, 1000);
    }

    stop() {
        this.isRunning = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Remove all particles
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        
        this.particles = [];
    }

    // Create special effect particles
    createBurst(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle burst-particle';
            
            const size = Math.random() * 3 + 2;
            const angle = (Math.PI * 2 * i) / count;
            const distance = Math.random() * 100 + 50;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                background: #d4af37;
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                opacity: 1;
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                box-shadow: 0 0 10px #d4af37;
            `;
            
            document.body.appendChild(particle);
            
            // Animate the burst particle
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${endX - x}px, ${endY - y}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = () => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            };
        }
    }

    // Dust motes effect
    createDustMotes() {
        const moteCount = 20;
        for (let i = 0; i < moteCount; i++) {
            const mote = document.createElement('div');
            mote.style.cssText = `
                position: absolute;
                width: 1px;
                height: 1px;
                background: rgba(255, 255, 255, 0.3);
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: dustFloat ${15 + Math.random() * 10}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            
            this.container.appendChild(mote);
            
            setTimeout(() => {
                if (mote.parentNode) {
                    mote.parentNode.removeChild(mote);
                }
            }, 25000);
        }
    }
}

// Additional CSS for particle effects
const particleStyles = `
    @keyframes dustFloat {
        0%, 100% { 
            transform: translate(0, 0); 
            opacity: 0; 
        }
        50% { 
            opacity: 0.3; 
            transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px); 
        }
    }
`;

const particleStyleSheet = document.createElement('style');
particleStyleSheet.textContent = particleStyles;
document.head.appendChild(particleStyleSheet);

// Export for use in main.js
window.ParticleSystem = ParticleSystem;