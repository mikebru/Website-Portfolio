// Project Page JavaScript

// Store gallery items and current index
let galleryItems = [];
let currentItemIndex = 0;

// Lightbox elements
let lightbox;
let lightboxContent;
let lightboxMediaContainer;
let closeButton;
let prevButton;
let nextButton;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the gallery and lightbox
    initGallery();
    
    // Initialize YouTube background if present
    initYouTubeBackground();
});

/**
 * Initialize YouTube background video if data attribute is present
 */
function initYouTubeBackground() {
    const youtubeBackground = document.getElementById('youtube-background');
    if (!youtubeBackground) return;
    
    const videoId = youtubeBackground.getAttribute('data-youtube-id');
    if (!videoId) return;
    
    // Load YouTube API
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        // Set up global callback for when YouTube API is ready
        window.onYouTubeIframeAPIReady = function() {
            createYouTubePlayer(youtubeBackground, videoId);
        };
    } else {
        // YouTube API already loaded
        createYouTubePlayer(youtubeBackground, videoId);
    }
}

/**
 * Create YouTube player for background video
 * @param {HTMLElement} container - The container element
 * @param {string} videoId - YouTube video ID
 */
function createYouTubePlayer(container, videoId) {
    new YT.Player(container.id, {
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'loop': 1,
            'playlist': videoId, // Same as videoId, needed for looping
            'mute': 1,
            'playsinline': 1,
            'modestbranding': 1
        },
        events: {
            'onReady': function(event) {
                event.target.playVideo();
                // Set quality to highest available
                event.target.setPlaybackQuality('hd1080');
            },
            'onStateChange': function(event) {
                // If video ends, restart it
                if (event.data === YT.PlayerState.ENDED) {
                    event.target.playVideo();
                }
            }
        }
    });
}

/**
 * Initialize gallery and lightbox functionality
 */
function initGallery() {
    // Get lightbox elements
    lightbox = document.querySelector('.lightbox');
    lightboxContent = document.querySelector('.lightbox-content');
    lightboxMediaContainer = document.querySelector('.lightbox-media-container');
    closeButton = document.querySelector('.close-lightbox');
    
    // Add navigation buttons to lightbox if they don't exist
    if (!document.querySelector('.lightbox-nav')) {
        const navHTML = `
            <div class="lightbox-nav">
                <button class="lightbox-nav-btn prev" aria-label="Previous image"></button>
                <button class="lightbox-nav-btn next" aria-label="Next image"></button>
            </div>
        `;
        lightboxContent.insertAdjacentHTML('beforeend', navHTML);
    }
    
    prevButton = document.querySelector('.lightbox-nav-btn.prev');
    nextButton = document.querySelector('.lightbox-nav-btn.next');
    
    // Get all gallery items (both images and videos)
    galleryItems = [...document.querySelectorAll('.gallery-item')];
    
    // Add click event to all gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            currentItemIndex = galleryItems.indexOf(this);
            openLightboxWithItem(currentItemIndex);
        });
        
        // For video items, add click events to play buttons and thumbnails
        if (item.classList.contains('video')) {
            const playButton = item.querySelector('.play-button');
            if (playButton) {
                playButton.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent double triggering
                    currentItemIndex = galleryItems.indexOf(item);
                    openLightboxWithItem(currentItemIndex);
                });
            }
            
            const videoThumbnail = item.querySelector('.video-thumbnail');
            if (videoThumbnail) {
                videoThumbnail.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent double triggering
                    currentItemIndex = galleryItems.indexOf(item);
                    openLightboxWithItem(currentItemIndex);
                });
            }
            
            // For local videos, also add click event to the video element
            const videoElement = item.querySelector('video');
            if (videoElement) {
                videoElement.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent double triggering
                    currentItemIndex = galleryItems.indexOf(item);
                    openLightboxWithItem(currentItemIndex);
                });
            }
        }
    });
    
    // Navigation button event listeners
    prevButton.addEventListener('click', showPreviousItem);
    nextButton.addEventListener('click', showNextItem);
    
    // Close lightbox when clicking the close button
    closeButton.addEventListener('click', closeLightbox);
    
    // Close lightbox when clicking outside the content
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPreviousItem();
                break;
            case 'ArrowRight':
                showNextItem();
                break;
        }
    });
}

/**
 * Open lightbox with a specific gallery item
 */
function openLightboxWithItem(index) {
    const item = galleryItems[index];
    
    // Clear previous content
    lightboxMediaContainer.innerHTML = '';
    
    // Prepare content based on item type
    if (item.classList.contains('image')) {
        const img = item.querySelector('img');
        
        // Create image element for lightbox - use src directly
        const lightboxImg = document.createElement('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        
        lightboxMediaContainer.appendChild(lightboxImg);
    } else if (item.classList.contains('video')) {
        const videoThumbnail = item.querySelector('.video-thumbnail');
        let mediaAdded = false;
        
        // Check for YouTube video
        const videoId = videoThumbnail.getAttribute('data-video-id');
        if (videoId) {
            // Create YouTube iframe
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            
            lightboxMediaContainer.appendChild(iframe);
            mediaAdded = true;
        }
        
        // Check for Vimeo video
        if (!mediaAdded) {
            const vimeoId = videoThumbnail.getAttribute('data-vimeo-id');
            if (vimeoId) {
                // Create Vimeo iframe
                const iframe = document.createElement('iframe');
                iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframe.allowFullscreen = true;
                
                lightboxMediaContainer.appendChild(iframe);
                mediaAdded = true;
            }
        }
        
        // Check for local video
        if (!mediaAdded) {
            const videoPath = videoThumbnail.getAttribute('data-video-path');
            if (videoPath) {
                // Create video element for local videos
                const video = document.createElement('video');
                video.src = videoPath;
                video.controls = true;
                video.autoplay = true;
                video.loop = false;
                video.style.maxWidth = '100%';
                video.style.maxHeight = '80vh';
                
                lightboxMediaContainer.appendChild(video);
            }
        }
    }
    
    // Show lightbox
    lightbox.classList.add('active');
    
    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';
    
    // Update navigation buttons visibility
    updateNavButtons();
}

/**
 * Show previous gallery item
 */
function showPreviousItem() {
    if (currentItemIndex > 0) {
        currentItemIndex--;
        openLightboxWithItem(currentItemIndex);
    }
}

/**
 * Show next gallery item
 */
function showNextItem() {
    if (currentItemIndex < galleryItems.length - 1) {
        currentItemIndex++;
        openLightboxWithItem(currentItemIndex);
    }
}

/**
 * Update navigation buttons visibility
 */
function updateNavButtons() {
    prevButton.style.visibility = currentItemIndex > 0 ? 'visible' : 'hidden';
    nextButton.style.visibility = currentItemIndex < galleryItems.length - 1 ? 'visible' : 'hidden';
}

/**
 * Close the lightbox
 */
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear content after animation completes
    setTimeout(() => {
        lightboxMediaContainer.innerHTML = '';
    }, 300);
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
