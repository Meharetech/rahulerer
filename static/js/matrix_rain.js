// Matrix Rain Effect JavaScript
class MatrixRain {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupDrops();
        this.animate();
        this.handleResize();
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        
        document.body.appendChild(this.canvas);
        
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.setupDrops();
    }

    setupDrops() {
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = `${this.fontSize}px monospace`;

        for (let i = 0; i < this.drops.length; i++) {
            const text = this.characters[Math.floor(Math.random() * this.characters.length)];
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);

            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Terminal Typewriter Effect
class TerminalTypewriter {
    constructor(element, text, speed = 100) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.currentIndex = 0;
        this.type();
    }

    type() {
        if (this.currentIndex < this.text.length) {
            this.element.textContent += this.text.charAt(this.currentIndex);
            this.currentIndex++;
            setTimeout(() => this.type(), this.speed);
        } else {
            // Add blinking cursor effect
            this.element.classList.add('terminal-cursor');
        }
    }
}

// Glitch Effect
class GlitchEffect {
    constructor(element) {
        this.element = element;
        this.originalText = element.textContent;
        this.glitchInterval = null;
        this.startGlitch();
    }

    startGlitch() {
        this.glitchInterval = setInterval(() => {
            this.applyGlitch();
        }, 3000);
    }

    applyGlitch() {
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const originalText = this.element.textContent;
        
        // Apply glitch effect
        this.element.classList.add('glitch');
        
        setTimeout(() => {
            this.element.textContent = this.originalText.split('').map(char => 
                Math.random() > 0.8 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
            ).join('');
        }, 100);
        
        setTimeout(() => {
            this.element.textContent = this.originalText;
            this.element.classList.remove('glitch');
        }, 200);
    }

    stopGlitch() {
        if (this.glitchInterval) {
            clearInterval(this.glitchInterval);
        }
    }
}

// Initialize Matrix effects when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start Matrix rain effect
    const matrixRain = new MatrixRain();
    
    // Apply typewriter effect to headers
    const headers = document.querySelectorAll('.login-header h1');
    headers.forEach(header => {
        const originalText = header.textContent;
        header.textContent = '';
        new TerminalTypewriter(header, originalText, 150);
    });
    
    // Apply glitch effect to headers
    headers.forEach(header => {
        new GlitchEffect(header);
    });
    
    // Add matrix scan effect to form inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.8)';
            this.style.borderColor = '#00ff41';
        });
        
        input.addEventListener('blur', function() {
            this.style.boxShadow = '0 0 15px rgba(0, 255, 65, 0.5)';
            this.style.borderColor = '#00ff41';
        });
    });
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add matrix-style form submission effect
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('.btn');
            if (submitBtn) {
                submitBtn.textContent = 'ACCESSING SYSTEM...';
                submitBtn.style.background = 'linear-gradient(45deg, #ff0040, #ff0066)';
                submitBtn.style.boxShadow = '0 0 25px rgba(255, 0, 64, 0.6)';
            }
        });
    });
});

// Add some cyberpunk sound effects (optional)
function playMatrixSound() {
    // This would require audio files, but we can simulate with console
    console.log('🔊 Matrix sound effect would play here');
}

// Add keyboard shortcuts for extra hacker feel
document.addEventListener('keydown', function(e) {
    // Ctrl + Alt + M for Matrix mode toggle
    if (e.ctrlKey && e.altKey && e.key === 'M') {
        document.body.classList.toggle('matrix-mode');
        playMatrixSound();
    }
    
    // Tab key navigation enhancement
    if (e.key === 'Tab') {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'BUTTON')) {
            activeElement.style.boxShadow = '0 0 25px rgba(0, 255, 65, 0.8)';
            setTimeout(() => {
                activeElement.style.boxShadow = '';
            }, 300);
        }
    }
});
