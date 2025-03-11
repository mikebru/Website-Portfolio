// Function to load the header
function loadHeader() {
    // Determine if we're in a project page or main page
    const isProjectPage = window.location.pathname.includes('/projects/');
    const headerPath = isProjectPage ? '../header.html' : 'header.html';
    
    // Create header HTML directly in JavaScript to avoid CORS issues with local files
    const headerHTML = `
    <header>
        <nav>
            <ul>
                <li><a href="${isProjectPage ? '../index.html' : 'index.html'}">Home</a></li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle">Projects</a>
                    <ul class="dropdown-menu">
                        <li><a href="${isProjectPage ? '../projects/39-inside.html' : 'projects/39-inside.html'}" class="project-link" data-project="39-inside">39 Inside</a></li>
                        <li><a href="${isProjectPage ? '../projects/cerp.html' : 'projects/cerp.html'}" class="project-link" data-project="cerp">CERP</a></li>
                        <li><a href="${isProjectPage ? '../projects/elemental-media.html' : 'projects/elemental-media.html'}" class="project-link" data-project="elemental-media">Elemental Media</a></li>
                        <li><a href="${isProjectPage ? '../projects/earth-works.html' : 'projects/earth-works.html'}" class="project-link" data-project="earth-works">Earth Works</a></li>
                        <li><a href="${isProjectPage ? '../projects/eyes-on-the-sky.html' : 'projects/eyes-on-the-sky.html'}" class="project-link" data-project="eyes-on-the-sky">Eyes on the Sky</a></li>
                        <li><a href="${isProjectPage ? '../projects/simply-sand-play.html' : 'projects/simply-sand-play.html'}" class="project-link" data-project="simply-sand-play">Simply Sand Play</a></li>
                        <li><a href="${isProjectPage ? '../projects/kiddo.html' : 'projects/kiddo.html'}" class="project-link" data-project="kiddo">Kiddo</a></li>
                        <li><a href="${isProjectPage ? '../projects/maybe-happy-ending.html' : 'projects/maybe-happy-ending.html'}" class="project-link" data-project="maybe-happy-ending">Maybe Happy Ending</a></li>
                        <li><a href="${isProjectPage ? '../projects/marcus.html' : 'projects/marcus.html'}" class="project-link" data-project="marcus">Marcus</a></li>
                        <li><a href="${isProjectPage ? '../projects/nhks.html' : 'projects/nhks.html'}" class="project-link" data-project="nhks">NHKS</a></li>
                    </ul>
                </li>
                <li><a href="${isProjectPage ? '../about.html' : 'about.html'}">About Me</a></li>
            </ul>
        </nav>
    </header>
    `;
    
    // Insert the header at the beginning of the body
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    
    // Initialize dropdown functionality
    initializeDropdown();
}

// Function to initialize dropdown functionality
function initializeDropdown() {
    // The dropdown toggle functionality
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            // We don't need to do anything here since the CSS handles the display
            // with :hover, but we need to prevent the default action
        });
    });
    
    // Project links now directly use href attributes instead of JavaScript navigation
    // This is handled by the HTML links in the header
}

document.addEventListener('DOMContentLoaded', function() {
    // Load the header
    loadHeader();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add fade-in animation for work items
    const workItems = document.querySelectorAll('.work-item');
    
    // Create an intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe each work item
    workItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
    
    // Add the CSS class for visible items
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .work-item.visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        </style>
    `);

    // Initialize the reaction-diffusion shader
    initReactionDiffusionShader();
});

// Reaction-Diffusion Shader Implementation
function initReactionDiffusionShader() {
    const canvas = document.getElementById('shader-canvas');
    if (!canvas) return;

    // Initialize WebGL context
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Set canvas size to match window
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Vertex shader source
    const vertexShaderSource = `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_position * 0.5 + 0.5;
        }
    `;

    // Fragment shader source inspired by reaction-diffusion patterns
    const fragmentShaderSource = `
        precision highp float;
        
        uniform vec2 u_resolution;
        uniform float u_time;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        
        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
            m = m*m;
            m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }
        
        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            float aspect = u_resolution.x / u_resolution.y;
            vec2 uv2 = vec2(uv.x * aspect, uv.y);
            
            // Time variables
            float t = u_time * 0.2;
            
            // Create base patterns with simplex noise at different scales and speeds
            float n1 = snoise(uv2 * 3.0 + t * vec2(0.1, 0.2));
            float n2 = snoise(uv2 * 8.0 - t * vec2(0.15, 0.1));
            float n3 = snoise(uv2 * 15.0 + t * vec2(0.2, -0.1));
            
            // Create organic patterns with sine waves
            float organicPattern = sin(uv.x * 15.0 + t) * sin(uv.y * 15.0 + t * 1.2) * 0.1;
            organicPattern += sin(uv.x * 3.0 - t * 0.3) * sin(uv.y * 6.0 + t * 0.5) * 0.15;
            
            // Reaction-diffusion-like pattern
            float pattern = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
            pattern += organicPattern;
            
            // Create two chemical-like substances (u and v)
            float u = 0.5 + 0.5 * sin(pattern * 5.0 + t);
            float v = 0.0 + 0.5 * cos(pattern * 4.0 - t * 1.5);
        

            //vec3 finalColor = vec3(v);
            
            
            // Create a color palette
            vec3 color1 = vec3(0.0, 0.0, 0.0);   // Dark blue
            vec3 color2 = vec3(0.2, 0.2, 0.2);    // Medium blue
            vec3 color3 = vec3(0.3, 0.3, 0.3);    // Bright blue
            vec3 color4 = vec3(0.5, 0.5, .5);    // Light blue
            
            // Map the reaction-diffusion values to colors
            vec3 finalColor = mix(color1, color3, v);

            
            // Output final color with alpha for overlay
            gl_FragColor = vec4(finalColor * clamp(u_time * .25,0.0,1.0), 0.8);
        }
    `;

    // Compile shaders
    function compileShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        return;
    }

    gl.useProgram(program);

    // Create a buffer for the vertices
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Two triangles to cover the entire canvas
    const positions = [
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Get attribute and uniform locations
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeUniformLocation = gl.getUniformLocation(program, 'u_time');

    // Enable the position attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Set the resolution uniform
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    
    // Animation loop
    let startTime = Date.now();
    
    function render() {
        // Update time uniform
        const currentTime = (Date.now() - startTime) / 1000.0;
        gl.uniform1f(timeUniformLocation, currentTime);
        
        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        // Request next frame
        requestAnimationFrame(render);
    }
    
    // Start the animation loop
    render();
}
