// Teaching Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize YouTube background if present
    initYouTubeBackground();
});

/**
 * Initialize YouTube background videos if data attribute is present
 */
function initYouTubeBackground() {
    const youtubeBackgrounds = document.querySelectorAll('.youtube-background');
    if (youtubeBackgrounds.length === 0) return;
    
    // Store all backgrounds to initialize when API is ready
    const backgroundsToInit = [];
    
    // Collect all backgrounds with valid video IDs
    youtubeBackgrounds.forEach(background => {
        const videoId = background.getAttribute('data-youtube-id');
        if (videoId) {
            backgroundsToInit.push({ element: background, videoId: videoId });
        }
    });
    
    if (backgroundsToInit.length === 0) return;
    
    // Load YouTube API
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        // Set up global callback for when YouTube API is ready
        window.onYouTubeIframeAPIReady = function() {
            backgroundsToInit.forEach(bg => {
                createYouTubePlayer(bg.element, bg.videoId);
            });
        };
    } else {
        // YouTube API already loaded
        backgroundsToInit.forEach(bg => {
            createYouTubePlayer(bg.element, bg.videoId);
        });
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
