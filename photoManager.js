// photoManager.js - Handles photo changing functionality
class PhotoManager {
    constructor() {
        this.photos = new Map();
        this.currentSelection = 'photo1';
        this.defaultImages = {
            photo1: 'https://via.placeholder.com/150x200/8B4513/FFFFFF?text=Evidence+1',
            photo2: 'https://via.placeholder.com/120x160/654321/FFFFFF?text=Suspect+A',
            photo3: 'https://via.placeholder.com/140x180/4A4A4A/FFFFFF?text=Location',
            photo4: 'https://via.placeholder.com/130x170/8B0000/FFFFFF?text=Clue+1',
            photo5: 'https://via.placeholder.com/110x150/2F4F4F/FFFFFF?text=Document',
            photo6: 'https://via.placeholder.com/125x165/556B2F/FFFFFF?text=Witness'
        };
    }

    init() {
        this.setupEventListeners();
        this.initializePhotoData();
        console.log('PhotoManager initialized');
    }

    initializePhotoData() {
        // Store references to all photo containers
        document.querySelectorAll('.photo-container').forEach(container => {
            const id = container.id;
            const img = container.querySelector('.evidence-photo');
            this.photos.set(id, {
                container: container,
                img: img,
                originalSrc: img.src,
                title: img.alt
            });
        });
    }

    setupEventListeners() {
        const photoSelect = document.getElementById('photoSelect');
        const imageUpload = document.getElementById('imageUpload');
        const imageUrl = document.getElementById('imageUrl');
        const changeButton = document.getElementById('changeImage');

        if (photoSelect) {
            photoSelect.addEventListener('change', (e) => {
                this.currentSelection = e.target.value;
                this.highlightSelectedPhoto();
            });
        }

        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files[0]);
            });
        }

        if (imageUrl) {
            imageUrl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.changeImageFromUrl(e.target.value);
                }
            });
        }

        if (changeButton) {
            changeButton.addEventListener('click', () => {
                const urlInput = document.getElementById('imageUrl');
                if (urlInput.value) {
                    this.changeImageFromUrl(urlInput.value);
                } else {
                    // Trigger file input
                    imageUpload.click();
                }
            });
        }

        // Add drag and drop functionality
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        document.querySelectorAll('.photo-container').forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.style.border = '3px dashed #d4af37';
                container.style.opacity = '0.7';
            });

            container.addEventListener('dragleave', (e) => {
                e.preventDefault();
                container.style.border = '';
                container.style.opacity = '';
            });

            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.style.border = '';
                container.style.opacity = '';
                
                const files = e.dataTransfer.files;
                if (files.length > 0 && files[0].type.startsWith('image/')) {
                    this.currentSelection = container.id;
                    this.handleFileUpload(files[0]);
                }
            });
        });
    }

    highlightSelectedPhoto() {
        // Remove previous highlights
        document.querySelectorAll('.photo-container').forEach(container => {
            container.style.boxShadow = '';
        });

        // Highlight selected photo
        const selected = document.getElementById(this.currentSelection);
        if (selected) {
            selected.style.boxShadow = '0 0 20px #d4af37, 0 0 40px #d4af37';
            
            // Remove highlight after a moment
            setTimeout(() => {
                selected.style.boxShadow = '';
            }, 2000);
        }
    }

    handleFileUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.changeImage(this.currentSelection, e.target.result);
            this.showNotification('Image updated successfully!', 'success');
        };

        reader.onerror = () => {
            this.showNotification('Error reading file', 'error');
        };

        reader.readAsDataURL(file);
    }

    changeImageFromUrl(url) {
        if (!url) {
            this.showNotification('Please enter a valid URL', 'error');
            return;
        }

        // Test if URL is accessible
        const img = new Image();
        img.onload = () => {
            this.changeImage(this.currentSelection, url);
            this.showNotification('Image updated successfully!', 'success');
            document.getElementById('imageUrl').value = '';
        };

        img.onerror = () => {
            this.showNotification('Unable to load image from URL', 'error');
        };

        img.src = url;
    }

    changeImage(photoId, newSrc) {
        const photoData = this.photos.get(photoId);
        if (!photoData) {
            console.error(`Photo ${photoId} not found`);
            return;
        }

        const { img, container } = photoData;
        
        // Add loading effect
        container.style.opacity = '0.5';
        container.style.transform = 'scale(0.95)';

        // Update image source
        img.src = newSrc;
        
        // Add load listener for smooth transition
        img.onload = () => {
            container.style.opacity = '';
            container.style.transform = '';
            
            // Add flash effect
            this.addUpdateFlash(container);
        };

        img.onerror = () => {
            // Revert to original on error
            img.src = photoData.originalSrc;
            container.style.opacity = '';
            container.style.transform = '';
            this.showNotification('Failed to load new image', 'error');
        };
    }

    addUpdateFlash(container) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(212, 175, 55, 0.8), rgba(212, 175, 55, 0.3));
            border-radius: 3px;
            animation: updateFlash 0.6s ease-out;
            pointer-events: none;
            z-index: 10;
        `;
        
        container.appendChild(flash);
        
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 600);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#d4af37'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 10000;
            animation: notificationSlide 0.3s ease-out;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notificationSlideOut 0.3s ease-in forwards';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 3000);
    }

    // Reset all photos to default
    resetAllPhotos() {
        this.photos.forEach((photoData, id) => {
            photoData.img.src = this.defaultImages[id];
        });
        this.showNotification('All photos reset to default', 'info');
    }

    // Get current photo data
    getPhotoData(photoId) {
        return this.photos.get(photoId);
    }

    // Save current state (could be extended to localStorage if needed)
    saveState() {
        const state = {};
        this.photos.forEach((photoData, id) => {
            state[id] = photoData.img.src;
        });
        return state;
    }
}

// Additional CSS for notifications and effects
const photoManagerStyles = `
    @keyframes updateFlash {
        0% { opacity: 0; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.02); }
        100% { opacity: 0; transform: scale(1); }
    }
    
    @keyframes notificationSlide {
        from { 
            transform: translateX(100%); 
            opacity: 0; 
        }
        to { 
            transform: translateX(0); 
            opacity: 1; 
        }
    }
    
    @keyframes notificationSlideOut {
        from { 
            transform: translateX(0); 
            opacity: 1; 
        }
        to { 
            transform: translateX(100%); 
            opacity: 0; 
        }
    }
`;

const photoStyleSheet = document.createElement('style');
photoStyleSheet.textContent = photoManagerStyles;
document.head.appendChild(photoStyleSheet);

// Export for use in main.js
window.PhotoManager = PhotoManager;