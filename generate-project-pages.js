#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const IMAGES_DIR = 'Images';
const PROJECTS_DIR = 'projects';
const DEFAULT_HERO_IMAGE_INDEX = 0; // Use the first image as hero by default

// Parse command line arguments
const args = process.argv.slice(2);

// Display help message if requested
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Project Page Generator
======================

This script generates project pages from image folders.

Usage:
  node generate-project-pages.js [options] [folder-name]

Options:
  --help, -h          Show this help message
  --hero=FILENAME     Specify a custom hero image filename
  --all               Process all image folders (default if no folder specified)

Examples:
  node generate-project-pages.js                   # Process all folders
  node generate-project-pages.js Memorii           # Process only the Memorii folder
  node generate-project-pages.js --hero=image.jpg Memorii  # Use specific hero image
    `);
    process.exit(0);
}

// Ensure projects directory exists
if (!fs.existsSync(PROJECTS_DIR)) {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

// Extract hero image option if provided
let customHeroImage = null;
const heroArg = args.find(arg => arg.startsWith('--hero='));
if (heroArg) {
    customHeroImage = heroArg.substring(7); // Remove '--hero=' prefix
    console.log(`Using custom hero image: ${customHeroImage}`);
    // Remove the hero argument from args
    const heroArgIndex = args.indexOf(heroArg);
    if (heroArgIndex !== -1) {
        args.splice(heroArgIndex, 1);
    }
}

// Check if a specific folder was provided as a command-line argument
// (any remaining argument that doesn't start with --)
const specificFolder = args.find(arg => !arg.startsWith('--'));

if (specificFolder) {
    // Process only the specified folder
    console.log(`Processing specific folder: ${specificFolder}`);
    
    // Check if the folder exists
    const folderPath = path.join(IMAGES_DIR, specificFolder);
    if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
        processImageFolder(specificFolder);
        console.log(`Processed folder: ${specificFolder}`);
        
        // Skip updating the navigation menu when processing a single folder
        console.log('Skipping navigation menu update for single folder processing.');
    } else {
        console.error(`Error: Folder "${specificFolder}" not found in ${IMAGES_DIR} directory.`);
        process.exit(1);
    }
} else {
    // Get all directories in the Images folder
    const imageFolders = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    console.log(`Found ${imageFolders.length} image folders to process.`);

    // Process each folder
    imageFolders.forEach(folderName => {
        processImageFolder(folderName);
    });

    // Update the navigation menu in script.js
    updateNavigationMenu(imageFolders);
}

console.log('Project page generation complete!');

/**
 * Process an image folder and create a project page
 * @param {string} folderName - The name of the image folder
 */
function processImageFolder(folderName) {
    console.log(`Processing folder: ${folderName}`);
    
    // Get all media files in the folder (images and videos)
    const folderPath = path.join(IMAGES_DIR, folderName);
    const mediaFiles = fs.readdirSync(folderPath)
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4'].includes(ext);
        });
    
    if (mediaFiles.length === 0) {
        console.log(`No media files found in ${folderName}, skipping.`);
        return;
    }
    
    // Create a slug for the project (lowercase, replace spaces with hyphens)
    const projectSlug = folderName.toLowerCase().replace(/\s+/g, '-');
    
    // Filter out just the image files (for hero image selection)
    const imageFiles = mediaFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });
    
    if (imageFiles.length === 0) {
        console.log(`No image files found in ${folderName} for hero image, skipping.`);
        return;
    }
    
    // Select a hero image
    let heroImage;
    
    if (customHeroImage && imageFiles.includes(customHeroImage)) {
        // Use the custom hero image if provided and exists in the folder
        heroImage = customHeroImage;
        console.log(`Using custom hero image: ${heroImage}`);
    } else if (customHeroImage) {
        // If custom hero was specified but not found, warn and use default
        console.warn(`Warning: Custom hero image "${customHeroImage}" not found in folder. Using default.`);
        heroImage = imageFiles[DEFAULT_HERO_IMAGE_INDEX];
    } else {
        // Use default (first image)
        heroImage = imageFiles[DEFAULT_HERO_IMAGE_INDEX];
    }
    
    // Create the project page HTML
    const projectHTML = generateProjectHTML(folderName, projectSlug, heroImage, mediaFiles);
    
    // Write the project page to file
    const outputPath = path.join(PROJECTS_DIR, `${projectSlug}.html`);
    fs.writeFileSync(outputPath, projectHTML);
    
    console.log(`Created project page: ${outputPath}`);
}

/**
 * Generate HTML for a project page
 * @param {string} projectName - The name of the project
 * @param {string} projectSlug - The slug for the project
 * @param {string} heroImage - The filename of the hero image
 * @param {string[]} mediaFiles - Array of media filenames (images and videos)
 * @returns {string} The HTML content for the project page
 */
function generateProjectHTML(projectName, projectSlug, heroImage, mediaFiles) {
    // Format the project name for display (remove hyphens, capitalize words)
    const displayName = projectName.replace(/-/g, ' ');
    
    // Check if there's an MP4 file that could be used as a hero video
    const heroVideoFile = mediaFiles.find(file => 
        path.extname(file).toLowerCase() === '.mp4' && 
        file.toLowerCase().includes('hero')
    );
    
    // Create gallery items HTML
    const galleryItemsHTML = mediaFiles.map(file => {
        const filePath = `../Images/${projectName}/${file}`;
        const fileExt = path.extname(file).toLowerCase();
        
        // Handle different file types
        if (fileExt === '.mp4') {
            // Look for a thumbnail with the same name as the video but with .jpg, .jpeg, or .png extension
            let thumbnailPath = null;
            const baseName = file.substring(0, file.lastIndexOf('.'));
            
            // Check if thumbnail exists with same name but different extension
            ['jpg', 'jpeg', 'png'].forEach(ext => {
                const potentialThumbnail = `${baseName}.${ext}`;
                if (mediaFiles.includes(potentialThumbnail)) {
                    thumbnailPath = `../Images/${projectName}/${potentialThumbnail}`;
                }
            });
            
            return `
            <div class="gallery-item video local-video">
                <div class="video-thumbnail" data-video-path="${filePath}">
                    <video src="${filePath}" preload="metadata" poster="${thumbnailPath || ''}" muted></video>
                    <div class="play-button"></div>
                </div>
            </div>`;
        } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExt)) {
            return `
            <div class="gallery-item image">
                <img src="${filePath}" alt="${displayName} - ${file}">
            </div>`;
        }
        
        // Default case (shouldn't happen with our filtering)
        return '';
    }).join('\n');
    
    // Generate hero section HTML based on whether we have a hero video
    let heroSectionHTML;
    if (heroVideoFile) {
        // Use video as hero
        heroSectionHTML = `
    <section class="project-hero">
        <video class="project-hero-video" autoplay loop muted playsinline>
            <source src="../Images/${projectName}/${heroVideoFile}" type="video/mp4">
            <!-- Fallback to static image if video doesn't load -->
            <div class="project-hero-image" style="background-image: url('../Images/${projectName}/${heroImage}');"></div>
        </video>
        <div class="project-hero-content">
            <h1>${displayName}</h1>
            <p class="project-subtitle">Project Location | Year</p>
        </div>
    </section>`;
    } else {
        // Use static image as hero
        heroSectionHTML = `
    <section class="project-hero">
        <div class="project-hero-image"></div>
        <div class="project-hero-content">
            <h1>${displayName}</h1>
            <p class="project-subtitle">Project Location | Year</p>
        </div>
    </section>`;
    }
    
    // Generate the full HTML
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${displayName} - Media + Architecture + Ecology</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="../project-styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
        /* Project-specific styles */
        ${!heroVideoFile ? `.project-hero-image {
            background-image: url('../Images/${projectName}/${heroImage}');
        }` : '/* Using video hero */'}
    </style>
</head>
<body>
    <!-- Header will be loaded via JavaScript -->

${heroSectionHTML}

    <section class="project-details">
        <div class="project-info">
            <div class="project-description">
                <h2>About the Project</h2>
                <p>This is an automatically generated project page for ${displayName}. Please update this description with details about the project.</p>
                
                <p>You can add multiple paragraphs to describe the project's concept, goals, and outcomes.</p>
                
                <p>Consider including information about the technologies used, the creative process, and any challenges or insights gained during the project.</p>
            </div>
            
            <div class="project-metadata">
                <div class="metadata-item">
                    <h3>Role</h3>
                    <p>Lead Designer, Creative Technologist</p>
                </div>
                <div class="metadata-item">
                    <h3>Technologies</h3>
                    <p>Add technologies used here</p>
                </div>
                <div class="metadata-item">
                    <h3>Duration</h3>
                    <p>Project duration</p>
                </div>
                <div class="metadata-item">
                    <h3>Collaborators</h3>
                    <p>List collaborators here</p>
                </div>
            </div>
        </div>
    </section>

    <section class="project-gallery">
        <h2>Gallery</h2>
        <div class="gallery-grid">
            ${galleryItemsHTML}
            
            <!-- Vimeo embed placeholder - replace VIDEO_ID with actual Vimeo ID -->
            <!-- 
            <div class="gallery-item video vimeo-video">
                <div class="video-thumbnail" data-vimeo-id="VIDEO_ID">
                    <img src="https://vumbnail.com/VIDEO_ID.jpg" alt="Vimeo video">
                    <div class="play-button"></div>
                </div>
            </div>
            -->
        </div>
    </section>

    <div class="lightbox">
        <div class="lightbox-content">
            <span class="close-lightbox">&times;</span>
            <div class="lightbox-media-container"></div>
        </div>
    </div>

    <footer>
        <div class="project-navigation">
            <a href="#" class="prev-project">Previous Project</a>
            <a href="../index.html" class="back-to-home">Back to Home</a>
            <a href="#" class="next-project">Next Project</a>
        </div>
        <p>&copy; 2025 Michael Bruner</p>
    </footer>

    <script src="../script.js"></script>
    <script src="../project-script.js"></script>
</body>
</html>`;
}

/**
 * Update the navigation menu in script.js to include all projects
 * @param {string[]} imageFolders - Array of image folder names
 */
function updateNavigationMenu(imageFolders) {
    console.log('Updating navigation menu...');
    
    // Read the current script.js file
    const scriptPath = 'script.js';
    let scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Find the dropdown menu section in the script
    const dropdownMenuRegex = /<ul class="dropdown-menu">([\s\S]*?)<\/ul>/;
    const match = scriptContent.match(dropdownMenuRegex);
    
    if (!match) {
        console.log('Could not find dropdown menu in script.js, skipping menu update.');
        return;
    }
    
    // Generate menu items for all projects
    const menuItems = imageFolders.map(folderName => {
        const projectSlug = folderName.toLowerCase().replace(/\s+/g, '-');
        const displayName = folderName;
        
        return `                        <li><a href="\${isProjectPage ? '../projects/${projectSlug}.html' : 'projects/${projectSlug}.html'}" class="project-link" data-project="${projectSlug}">${displayName}</a></li>`;
    }).join('\n');
    
    // Replace the dropdown menu content
    const newDropdownMenu = `<ul class="dropdown-menu">\n${menuItems}\n                    </ul>`;
    const updatedScript = scriptContent.replace(dropdownMenuRegex, newDropdownMenu);
    
    // Write the updated script back to file
    fs.writeFileSync(scriptPath, updatedScript);
    
    console.log('Navigation menu updated successfully.');
}
