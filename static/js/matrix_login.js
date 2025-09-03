// Matrix Style Login JavaScript - Completely New Design

// Global variables
let isAdminMode = false;
let matrixParticles = [];
let currentTime = new Date();

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔒 Matrix Style Login System Initialized');
    
    // Initialize based on page type
    if (document.body.classList.contains('admin-mode')) {
        isAdminMode = true;
        initializeAdminMode();
    } else {
        initializeUserMode();
    }
    
    // Common initialization
    initializeMatrixBackground();
    initializeFormEffects();
    initializeMatrixAnimations();
    startMatrixEffects();
});

// ============================================================================
// MODE INITIALIZATION
// ============================================================================

function initializeUserMode() {
    console.log('👤 User Mode Initialized');
    addMatrixLog('USER', 'User authentication module loaded');
    addMatrixLog('USER', 'Matrix grid active');
}

function initializeAdminMode() {
    console.log('🔴 Admin Mode Initialized');
    addMatrixLog('ADMIN', 'Administrator module loaded');
    addMatrixLog('ADMIN', 'Security protocols activated');
    
    // Initialize admin-specific features
    initializeSecurityIndicator();
}

// ============================================================================
// MATRIX BACKGROUND
// ============================================================================

function initializeMatrixBackground() {
    // Create additional matrix particles
    createMatrixParticles();
    
    // Initialize matrix streams
    initializeMatrixStreams();
    
    // Initialize grid overlay
    initializeGridOverlay();
}

function createMatrixParticles() {
    const particlesContainer = document.querySelector('.matrix-particles');
    if (!particlesContainer) return;
    
    // Create random matrix particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'matrix-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: ${Math.random() > 0.5 ? 'var(--matrix-green)' : 'var(--matrix-cyan)'};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.5 + 0.1};
            animation: matrixParticleFloat ${Math.random() * 10 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        particlesContainer.appendChild(particle);
    }
}

function initializeMatrixStreams() {
    // Create additional data streams
    const streamsContainer = document.querySelector('.matrix-streams');
    if (!streamsContainer) return;
    
    // Add multiple stream layers
    for (let i = 0; i < 3; i++) {
        const stream = document.createElement('div');
        stream.className = 'data-stream';
        stream.style.cssText = `
            position: absolute;
            top: 0;
            left: ${i * 33}%;
            width: 2px;
            height: 100%;
            background: linear-gradient(to bottom, transparent, var(--matrix-green), transparent);
            animation: dataStreamFlow ${Math.random() * 5 + 3}s linear infinite;
            animation-delay: ${i * 2}s;
        `;
        streamsContainer.appendChild(stream);
    }
}

function initializeGridOverlay() {
    // Add dynamic grid effects
    const grid = document.querySelector('.matrix-grid');
    if (!grid) return;
    
    // Add grid pulse effect
    setInterval(() => {
        grid.style.opacity = Math.random() * 0.3 + 0.1;
    }, 2000);
}

// ============================================================================
// MATRIX ANIMATIONS
// ============================================================================

function initializeMatrixAnimations() {
    // Add CSS animations
    addMatrixCSSAnimations();
    
    // Initialize particle system
    initializeParticleSystem();
    
    // Initialize glow effects
    initializeGlowEffects();
}

function addMatrixCSSAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes matrixParticleFloat {
            0% { 
                transform: translateY(0px) rotate(0deg);
                opacity: 0;
            }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { 
                transform: translateY(-100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes dataStreamFlow {
            0% { 
                transform: translateY(-100%);
                opacity: 0;
            }
            50% { opacity: 1; }
            100% { 
                transform: translateY(100%);
                opacity: 0;
            }
        }
        
        @keyframes matrixGlow {
            0%, 100% { 
                box-shadow: 0 0 20px var(--shadow-green);
                text-shadow: 0 0 10px var(--matrix-green);
            }
            50% { 
                box-shadow: 0 0 30px var(--shadow-green), 0 0 40px var(--shadow-green);
                text-shadow: 0 0 15px var(--matrix-green), 0 0 25px var(--matrix-green);
            }
        }
        
        @keyframes adminGlow {
            0%, 100% { 
                box-shadow: 0 0 20px var(--admin-shadow);
                text-shadow: 0 0 10px var(--admin-red);
            }
            50% { 
                box-shadow: 0 0 30px var(--admin-shadow), 0 0 40px var(--admin-shadow);
                text-shadow: 0 0 15px var(--admin-red), 0 0 25px var(--admin-red);
            }
        }
    `;
    document.head.appendChild(style);
}

function initializeParticleSystem() {
    // Create floating matrix characters
    createMatrixCharacters();
    
    // Initialize particle movement
    setInterval(moveMatrixParticles, 100);
}

function createMatrixCharacters() {
    const particlesContainer = document.querySelector('.matrix-particles');
    if (!particlesContainer) return;
    
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    
    for (let i = 0; i < 20; i++) {
        const char = document.createElement('div');
        char.className = 'matrix-character';
        char.textContent = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        char.style.cssText = `
            position: absolute;
            color: var(--matrix-green);
            font-family: 'Space Mono', monospace;
            font-size: ${Math.random() * 20 + 10}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.3 + 0.1};
            animation: matrixCharFloat ${Math.random() * 15 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
            text-shadow: 0 0 10px var(--matrix-green);
        `;
        particlesContainer.appendChild(char);
    }
    
    // Add CSS for matrix characters
    const style = document.createElement('style');
    style.textContent = `
        @keyframes matrixCharFloat {
            0% { 
                transform: translateY(0px) rotate(0deg);
                opacity: 0;
            }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { 
                transform: translateY(-100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function moveMatrixParticles() {
    const particles = document.querySelectorAll('.matrix-particle, .matrix-character');
    particles.forEach(particle => {
        const currentTop = parseFloat(particle.style.top) || 0;
        particle.style.top = (currentTop - 0.5) + '%';
        
        if (currentTop < -10) {
            particle.style.top = '110%';
        }
    });
}

function initializeGlowEffects() {
    // Add pulsing glow to form elements
    const form = document.querySelector('.login-form');
    if (form) {
        form.style.animation = isAdminMode ? 'adminGlow 3s ease-in-out infinite' : 'matrixGlow 3s ease-in-out infinite';
    }
}

// ============================================================================
// FORM EFFECTS
// ============================================================================

function initializeFormEffects() {
    // Initialize input effects
    initializeInputEffects();
    
    // Initialize button effects
    initializeButtonEffects();
    
    // Initialize form submission
    initializeFormSubmission();
}

function initializeInputEffects() {
    const inputs = document.querySelectorAll('.matrix-input');
    
    inputs.forEach(input => {
        // Focus effects
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
            addMatrixLog('INPUT', `Field focused: ${this.placeholder}`);
            
            // Add matrix scan effect
            addMatrixScanEffect(this);
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
        
        // Input effects
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.parentElement.classList.add('has-value');
                addMatrixLog('INPUT', `Value entered: ${this.value.length} characters`);
            } else {
                this.parentElement.classList.remove('has-value');
            }
        });
        
        // Key effects
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                addMatrixLog('INPUT', 'Enter key pressed');
            }
        });
    });
}

function addMatrixScanEffect(input) {
    // Create scanning line effect
    const scanLine = document.createElement('div');
    scanLine.className = 'matrix-scan-line';
    scanLine.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, var(--matrix-green), transparent);
        animation: matrixScan 0.5s ease-in-out;
        z-index: 1;
    `;
    
    input.parentElement.appendChild(scanLine);
    
    // Remove scan line after animation
    setTimeout(() => {
        if (scanLine.parentNode) {
            scanLine.parentNode.removeChild(scanLine);
        }
    }, 500);
}

function initializeButtonEffects() {
    const buttons = document.querySelectorAll('.matrix-button');
    
    buttons.forEach(button => {
        // Hover effects
        button.addEventListener('mouseenter', function() {
            addMatrixLog('BUTTON', 'Button hovered');
            addButtonGlowEffect(this);
        });
        
        button.addEventListener('mouseleave', function() {
            removeButtonGlowEffect(this);
        });
    });
}

function addButtonGlowEffect(button) {
    button.style.animation = isAdminMode ? 'adminGlow 1s ease-in-out infinite' : 'matrixGlow 1s ease-in-out infinite';
}

function removeButtonGlowEffect(button) {
    button.style.animation = '';
}

function initializeFormSubmission() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('.matrix-button');
            const buttonText = submitBtn.querySelector('.button-text');
            const buttonLoading = submitBtn.querySelector('.button-loading');
            
            // Show loading state
            buttonText.style.display = 'none';
            buttonLoading.style.display = 'flex';
            submitBtn.disabled = true;
            submitBtn.classList.add('submitting');
            
            // Add submission log
            addMatrixLog('FORM', 'Form submission initiated');
            
            // Add matrix effects
            addMatrixSubmissionEffects(submitBtn);
        });
    });
}

function addMatrixSubmissionEffects(button) {
    // Add matrix rain effect to button
    const matrixRain = document.createElement('div');
    matrixRain.className = 'matrix-rain-effect';
    matrixRain.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            var(--matrix-green) 2px,
            var(--matrix-green) 4px
        );
        animation: matrixRainEffect 1s ease-in-out;
        z-index: 1;
    `;
    
    button.appendChild(matrixRain);
    
    // Remove effect after animation
    setTimeout(() => {
        if (matrixRain.parentNode) {
            matrixRain.parentNode.removeChild(matrixRain);
        }
    }, 1000);
}

// ============================================================================
// PASSWORD TOGGLE
// ============================================================================

function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleBtn = passwordField.nextElementSibling;
    const icon = toggleBtn.querySelector('i');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        addMatrixLog('PASSWORD', 'Password visibility: SHOWN');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        addMatrixLog('PASSWORD', 'Password visibility: HIDDEN');
    }
}

function toggleAdminPassword() {
    const passwordField = document.getElementById('adminPassword');
    const toggleBtn = passwordField.nextElementSibling;
    const icon = toggleBtn.querySelector('i');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        addMatrixLog('ADMIN', 'Admin password visibility: SHOWN');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        addMatrixLog('ADMIN', 'Admin password visibility: HIDDEN');
    }
}

// ============================================================================
// ADMIN FEATURES
// ============================================================================

function initializeAdminMode() {
    // Add admin-specific matrix effects
    addAdminMatrixEffects();
    
    // Initialize security features
    initializeSecurityFeatures();
}

function addAdminMatrixEffects() {
    // Change matrix color scheme for admin
    const matrixBg = document.querySelector('.matrix-bg');
    if (matrixBg) {
        matrixBg.style.filter = 'hue-rotate(300deg)';
    }
}

function initializeSecurityFeatures() {
    // Add security level indicator
    const securityBar = document.querySelector('.security-fill');
    if (securityBar) {
        // Animate security level
        let level = 0;
        const interval = setInterval(() => {
            level += 2;
            securityBar.style.width = level + '%';
            
            if (level >= 100) {
                clearInterval(interval);
                addMatrixLog('ADMIN', 'Security level: MAXIMUM ACHIEVED');
            }
        }, 50);
    }
}

function initializeSecurityIndicator() {
    // Add pulsing effect to security indicator
    const securityText = document.querySelector('.security-text');
    if (securityText) {
        securityText.style.animation = 'adminGlow 2s ease-in-out infinite';
    }
}

// ============================================================================
// MATRIX LOGGING
// ============================================================================

function addMatrixLog(level, message) {
    const timestamp = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    console.log(`[${timestamp}] ${level}: ${message}`);
    
    // Add visual matrix effect
    addMatrixVisualLog(level, message);
}

function addMatrixVisualLog(level, message) {
    // Create floating matrix log
    const logElement = document.createElement('div');
    logElement.className = 'matrix-log';
    logElement.style.cssText = `
        position: fixed;
        top: ${Math.random() * 50 + 25}%;
        left: ${Math.random() * 50 + 25}%;
        color: var(--matrix-green);
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        z-index: 1000;
        pointer-events: none;
        animation: matrixLogFloat 3s ease-out forwards;
        text-shadow: 0 0 10px var(--matrix-green);
    `;
    logElement.textContent = `[${level}] ${message}`;
    
    document.body.appendChild(logElement);
    
    // Remove log after animation
    setTimeout(() => {
        if (logElement.parentNode) {
            logElement.parentNode.removeChild(logElement);
        }
    }, 3000);
}

// ============================================================================
// MATRIX EFFECTS LOOP
// ============================================================================

function startMatrixEffects() {
    // Start continuous matrix effects
    setInterval(() => {
        updateMatrixEffects();
    }, 100);
    
    // Add random matrix events
    setInterval(() => {
        triggerRandomMatrixEvent();
    }, 5000);
}

function updateMatrixEffects() {
    // Update particle positions
    moveMatrixParticles();
    
    // Update grid effects
    updateGridEffects();
    
    // Update stream effects
    updateStreamEffects();
}

function updateGridEffects() {
    const grid = document.querySelector('.matrix-grid');
    if (grid) {
        // Add subtle grid movement
        const currentTransform = grid.style.transform || 'translate(0, 0)';
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        grid.style.transform = `translate(${x}px, ${y}px)`;
    }
}

function updateStreamEffects() {
    const streams = document.querySelectorAll('.data-stream');
    streams.forEach(stream => {
        // Add random stream intensity
        const opacity = Math.random() * 0.3 + 0.1;
        stream.style.opacity = opacity;
    });
}

function triggerRandomMatrixEvent() {
    const events = [
        'Matrix grid recalibrating...',
        'Data streams optimized',
        'Security protocols updated',
        'Neural network synchronized',
        'Quantum encryption active'
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    addMatrixLog('SYSTEM', randomEvent);
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

document.addEventListener('keydown', function(e) {
    // Ctrl + Enter to submit form
    if (e.ctrlKey && e.key === 'Enter') {
        const form = document.querySelector('form');
        if (form) {
            form.submit();
        }
    }
    
    // Ctrl + U to toggle password
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        if (isAdminMode) {
            toggleAdminPassword();
        } else {
            togglePassword();
        }
    }
    
    // Ctrl + M to toggle matrix effects
    if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleMatrixEffects();
    }
    
    // Ctrl + R to refresh matrix
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        refreshMatrixBackground();
    }
});

function toggleMatrixEffects() {
    const matrixBg = document.querySelector('.matrix-bg');
    if (matrixBg) {
        matrixBg.style.animationPlayState = 
            matrixBg.style.animationPlayState === 'paused' ? 'running' : 'paused';
        addMatrixLog('SYSTEM', 'Matrix effects toggled');
    }
}

function refreshMatrixBackground() {
    // Recreate matrix particles
    const particlesContainer = document.querySelector('.matrix-particles');
    if (particlesContainer) {
        particlesContainer.innerHTML = '';
        createMatrixParticles();
        createMatrixCharacters();
    }
    addMatrixLog('SYSTEM', 'Matrix background refreshed');
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes matrixScan {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    
    @keyframes matrixRainEffect {
        0% { opacity: 0; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1.2); }
        100% { opacity: 0; transform: scale(1); }
    }
    
    @keyframes matrixLogFloat {
        0% { 
            opacity: 1; 
            transform: translateY(0px) scale(1);
        }
        100% { 
            opacity: 0; 
            transform: translateY(-50px) scale(0.8);
        }
    }
`;
document.head.appendChild(style);

console.log('🚀 Matrix Style Login System Ready!');
console.log('📋 Available commands:');
console.log('  - Ctrl + Enter: Submit form');
console.log('  - Ctrl + U: Toggle password visibility');
console.log('  - Ctrl + M: Toggle matrix effects');
console.log('  - Ctrl + R: Refresh matrix background');
