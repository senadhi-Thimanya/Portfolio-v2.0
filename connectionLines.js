// connectionLines.js - Dynamic connection lines between photos
class ConnectionLines {
    constructor() {
        this.svg = null;
        this.lines = [];
        this.connections = new Map();
        this.isInteractive = false;
        this.currentMode = 'static'; // 'static', 'interactive', 'animated'
    }

    init() {
        this.svg = document.querySelector('.connection-lines');
        if (!this.svg) {
            console.error('SVG container not found');
            return;
        }

        this.setupDefaultConnections();
        this.setupInteractivity();
        this.startAnimation();
        
        console.log('ConnectionLines initialized');
    }

    setupDefaultConnections() {
        // Define default connections between photos
        const defaultConnections = [
            { from: 'photo1', to: 'photo2', color: '#8b0000' },
            { from: 'photo2', to: 'photo3', color: '#8b0000' },
            { from: 'photo1', to: 'photo4', color: '#d4af37' },
            { from: 'photo5', to: 'photo6', color: '#8b0000' },
            { from: 'photo1', to: 'photo1', color: '#8b0000' } // Self connection for mystery
        ];

        defaultConnections.forEach(conn => {
            this.createConnection(conn.from, conn.to, conn.color);
        });
    }

    createConnection(fromId, toId, color = '#8b0000', animated = true) {
        const fromElement = document.getElementById(fromId);
        const toElement = document.getElementById(toId);
        
        if (!fromElement || !toElement) {
            console.warn(`Cannot create connection: ${fromId} -> ${toId}`);
            return null;
        }

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'connection-line');
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('opacity', '0.7');
        
        if (animated) {
            line.setAttribute('stroke-dasharray', '5,5');
            line.style.animation = 'dashMove 3s linear infinite';
        }
        
        line.style.filter = `drop-shadow(0 0 5px ${color})`;

        this.svg.appendChild(line);
        this.lines.push(line);

        const connectionData = {
            line: line,
            from: fromId,
            to: toId,
            color: color,
            animated: animated
        };

        this.connections.set(line, connectionData);
        this.updateLinePosition(connectionData);

        return line;
    }

    updateLinePosition(connectionData) {
        const fromElement = document.getElementById(connectionData.from);
        const toElement = document.getElementById(connectionData.to);
        
        if (!fromElement || !toElement) return;

        const boardRect = document.querySelector('.detective-board').getBoundingClientRect();
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();

        // Calculate centers relative to the SVG container
        const fromX = ((fromRect.left + fromRect.width / 2) - boardRect.left) / boardRect.width * 100;
        const fromY = ((fromRect.top + fromRect.height / 2) - boardRect.top) / boardRect.height * 100;
        const toX = ((toRect.left + toRect.width / 2) - boardRect.left) / boardRect.width * 100;
        const toY = ((toRect.top + toRect.height / 2) - boardRect.top) / boardRect.height * 100;

        connectionData.line.setAttribute('x1', `${fromX}%`);
        connectionData.line.setAttribute('y1', `${fromY}%`);
        connectionData.line.setAttribute('x2', `${toX}%`);
        connectionData.line.setAttribute('y2', `${toY}%`);
    }

    updateAllPositions() {
        this.connections.forEach(connectionData => {
            this.updateLinePosition(connectionData);
        });
    }

    setupInteractivity() {
        // Update positions on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateAllPositions();
            }, 100);
        });

        // Add photo hover effects
        document.querySelectorAll('.photo-container').forEach(photo => {
            photo.addEventListener('mouseenter', () => {
                this.highlightConnections(photo.id);
            });

            photo.addEventListener('mouseleave', () => {
                this.resetConnectionHighlights();
            });

            photo.addEventListener('click', () => {
                if (this.isInteractive) {
                    this.handlePhotoClick(photo.id);
                }
            });
        });

        // Periodically update positions in case photos move
        setInterval(() => {
            this.updateAllPositions();
        }, 1000);
    }

    highlightConnections(photoId) {
        this.connections.forEach(connectionData => {
            const { line, from, to } = connectionData;
            
            if (from === photoId || to === photoId) {
                line.setAttribute('stroke-width', '4');
                line.setAttribute('opacity', '1');
                line.style.filter = `drop-shadow(0 0 15px ${connectionData.color})`;
            } else {
                line.setAttribute('opacity', '0.3');
            }
        });
    }

    resetConnectionHighlights() {
        this.connections.forEach(connectionData => {
            const { line, color } = connectionData;
            line.setAttribute('stroke-width', '2');
            line.setAttribute('opacity', '0.7');
            line.style.filter = `drop-shadow(0 0 5px ${color})`;
        });
    }

    handlePhotoClick(photoId) {
        // Create temporary connection effect
        this.createTemporaryBurst(photoId);
    }

    createTemporaryBurst(photoId) {
        const photo = document.getElementById(photoId);
        if (!photo) return;

        const rect = photo.getBoundingClientRect();
        const boardRect = document.querySelector('.detective-board').getBoundingClientRect();
        
        const centerX = ((rect.left + rect.width / 2) - boardRect.left) / boardRect.width * 100;
        const centerY = ((rect.top + rect.height / 2) - boardRect.top) / boardRect.height * 100;

        // Create burst lines
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const length = 15; // percentage
            const endX = centerX + Math.cos(angle) * length;
            const endY = centerY + Math.sin(angle) * length;

            const burstLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            burstLine.setAttribute('x1', `${centerX}%`);
            burstLine.setAttribute('y1', `${centerY}%`);
            burstLine.setAttribute('x2', `${endX}%`);
            burstLine.setAttribute('y2', `${endY}%`);
            burstLine.setAttribute('stroke', '#d4af37');
            burstLine.setAttribute('stroke-width', '3');
            burstLine.setAttribute('opacity', '0');
            burstLine.style.filter = 'drop-shadow(0 0 10px #d4af37)';

            this.svg.appendChild(burstLine);

            // Animate the burst
            burstLine.animate([
                { opacity: 0, strokeWidth: 3 },
                { opacity: 1, strokeWidth: 1 },
                { opacity: 0, strokeWidth: 0.5 }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = () => {
                if (burstLine.parentNode) {
                    burstLine.parentNode.removeChild(burstLine);
                }
            };
        }
    }

    // Toggle interactive mode
    toggleInteractiveMode() {
        this.isInteractive = !this.isInteractive;
        
        const indicator = document.createElement('div');
        indicator.textContent = this.isInteractive ? 'Interactive Mode ON' : 'Interactive Mode OFF';
        indicator.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: #d4af37;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 1.2rem;
            z-index: 10000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 2000);
    }

    // Add new connection manually
    addConnection(fromId, toId, color = '#8b0000') {
        return this.createConnection(fromId, toId, color);
    }

    // Remove connection
    removeConnection(line) {
        const connectionData = this.connections.get(line);
        if (connectionData) {
            this.connections.delete(line);
            const index = this.lines.indexOf(line);
            if (index > -1) {
                this.lines.splice(index, 1);
            }
            if (line.parentNode) {
                line.parentNode.removeChild(line);
            }
        }
    }

    // Clear all connections
    clearAllConnections() {
        this.lines.forEach(line => {
            if (line.parentNode) {
                line.parentNode.removeChild(line);
            }
        });
        this.lines = [];
        this.connections.clear();
    }

    startAnimation() {
        // Add subtle pulsing to some connections
        this.connections.forEach((connectionData, line) => {
            if (Math.random() > 0.7) { // 30% chance for pulse
                setTimeout(() => {
                    this.addPulseEffect(line);
                }, Math.random() * 5000);
            }
        });
    }

    addPulseEffect(line) {
        const originalOpacity = line.getAttribute('opacity');
        
        line.animate([
            { opacity: originalOpacity },
            { opacity: '1' },
            { opacity: originalOpacity }
        ], {
            duration: 2000,
            easing: 'ease-in-out'
        });
    }
}

// Additional CSS for connection effects
const connectionStyles = `
    @keyframes fadeInOut {
        0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
`;

const connectionStyleSheet = document.createElement('style');
connectionStyleSheet.textContent = connectionStyles;
document.head.appendChild(connectionStyleSheet);

// Export for use in main.js
window.ConnectionLines = ConnectionLines;