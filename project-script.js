// Project Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the lightbox functionality
    initLightbox();
    
    // Initialize video thumbnails
    initVideoThumbnails();
});

/**
 * Initialize lightbox functionality for gallery items
 */
function initLightbox() {
    const lightbox = document.querySelector('.lightbox');
    const lightboxMediaContainer = document.querySelector('.lightbox-media-container');
    const closeButton = document.querySelector('.close-lightbox');
    
    // Add click event to all gallery image items
    document.querySelectorAll('.gallery-item.image').forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const fullSizeImageSrc = img.getAttribute('data-full') || img.src;
            
            // Create image element for lightbox
            const lightboxImg = document.createElement('img');
            lightboxImg.src = fullSizeImageSrc;
            lightboxImg.alt = img.alt;
            
            // Clear previous content and add new image
            lightboxMediaContainer.innerHTML = '';
            lightboxMediaContainer.appendChild(lightboxImg);
            
            // Show lightbox
            lightbox.classList.add('active');
            
            // Prevent scrolling on body
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close lightbox when clicking the close button
    closeButton.addEventListener('click', closeLightbox);
    
    // Close lightbox when clicking outside the content
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Close lightbox with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
    
    // Function to close the lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear content after animation completes
        setTimeout(() => {
            lightboxMediaContainer.innerHTML = '';
        }, 300);
    }
}

/**
 * Initialize video thumbnails
 */
function initVideoThumbnails() {
    document.querySelectorAll('.video-thumbnail').forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            if (!videoId) return;
            
            const lightbox = document.querySelector('.lightbox');
            const lightboxMediaContainer = document.querySelector('.lightbox-media-container');
            
            // Create YouTube iframe
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            
            // Clear previous content and add iframe
            lightboxMediaContainer.innerHTML = '';
            lightboxMediaContainer.appendChild(iframe);
            
            // Show lightbox
            lightbox.classList.add('active');
            
            // Prevent scrolling on body
            document.body.style.overflow = 'hidden';
        });
    });
}

/**
 * Create a sample project page from the template
 * @param {string} projectId - The ID of the project
 * @param {Object} projectData - The project data
 */
function createProjectPage(projectId, projectData) {
    // This function would be used to dynamically create project pages
    // from the template using JavaScript
    
    // Example implementation:
    // 1. Clone the template
    // 2. Replace placeholder content with actual project data
    // 3. Set the hero image
    // 4. Populate the gallery
    // 5. Save as a new HTML file or render dynamically
    
    // This would typically be part of a build process or CMS
}

// No need for additional project link handling as it's now handled in the main script.js
