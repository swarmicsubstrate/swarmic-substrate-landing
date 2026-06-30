// Swarmic Substrate - Particle Canvas Simulation
// A premium particle system that visualizes distributed network nodes

import './style.css';

(function() {
    'use strict';

    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    // Configuration
    const CONFIG = {
        particleCount: 80,
        particleMinRadius: 1.5,
        particleMaxRadius: 3,
        connectionDistance: 150,
        mouseInfluenceRadius: 200,
        baseSpeed: 0.3,
        colors: {
            particle: '#58a6ff',
            particleGlow: 'rgba(88, 166, 255, 0.3)',
            connection: 'rgba(88, 166, 255, 0.15)',
            connectionActive: 'rgba(88, 166, 255, 0.4)'
        }
    };

    let particles = [];
    let mouse = { x: null, y: null, radius: CONFIG.mouseInfluenceRadius };
    let animationId = null;
    let width = 0;
    let height = 0;

    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = CONFIG.particleMinRadius + Math.random() * (CONFIG.particleMaxRadius - CONFIG.particleMinRadius);
            this.vx = (Math.random() - 0.5) * CONFIG.baseSpeed * 2;
            this.vy = (Math.random() - 0.5) * CONFIG.baseSpeed * 2;
            this.opacity = 0.3 + Math.random() * 0.7;
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.pulseSpeed = 0.02 + Math.random() * 0.03;
        }

        update() {
            // Mouse interaction - particles are attracted slightly
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius * 0.02;
                    this.vx += dx / dist * force;
                    this.vy += dy / dist * force;
                }
            }

            // Update position
            this.x += this.vx;
            this.y += this.vy;

            // Damping to prevent excessive speed
            this.vx *= 0.99;
            this.vy *= 0.99;

            // Pulse animation
            this.pulsePhase += this.pulseSpeed;

            // Boundary wrapping
            if (this.x < -this.radius) this.x = width + this.radius;
            if (this.x > width + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = height + this.radius;
            if (this.y > height + this.radius) this.y = -this.radius;
        }

        draw() {
            const pulseFactor = 0.3 + Math.sin(this.pulsePhase) * 0.2;
            const currentOpacity = this.opacity * (0.8 + pulseFactor * 0.4);
            const currentRadius = this.radius * (1 + pulseFactor * 0.3);

            // Glow effect
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius * 3, 0, Math.PI * 2);
            const glowGradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, currentRadius * 3
            );
            glowGradient.addColorStop(0, `rgba(88, 166, 255, ${currentOpacity * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(88, 166, 255, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fill();

            // Core particle
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(88, 166, 255, ${currentOpacity})`;
            ctx.fill();
        }
    }

    // Initialize canvas and particles
    function init() {
        resize();
        particles = [];
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Handle resize
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Redistribute particles if they exist
        particles.forEach(p => {
            if (p.x > width) p.x = Math.random() * width;
            if (p.y > height) p.y = Math.random() * height;
        });
    }

    // Draw connections between nearby particles
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.connectionDistance) {
                    const opacity = 1 - (dist / CONFIG.connectionDistance);

                    // Check if near mouse for highlighting
                    let isNearMouse = false;
                    if (mouse.x !== null && mouse.y !== null) {
                        const midX = (particles[i].x + particles[j].x) / 2;
                        const midY = (particles[i].y + particles[j].y) / 2;
                        const mouseDist = Math.sqrt(
                            (midX - mouse.x) ** 2 + (midY - mouse.y) ** 2
                        );
                        isNearMouse = mouseDist < mouse.radius;
                    }

                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);

                    if (isNearMouse) {
                        ctx.strokeStyle = `rgba(88, 166, 255, ${opacity * 0.5})`;
                        ctx.lineWidth = 1.5;
                    } else {
                        ctx.strokeStyle = `rgba(88, 166, 255, ${opacity * 0.15})`;
                        ctx.lineWidth = 1;
                    }
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections first (behind particles)
        drawConnections();

        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Draw mouse glow
        if (mouse.x !== null && mouse.y !== null) {
            const gradient = ctx.createRadialGradient(
                mouse.x, mouse.y, 0,
                mouse.x, mouse.y, mouse.radius
            );
            gradient.addColorStop(0, 'rgba(88, 166, 255, 0.1)');
            gradient.addColorStop(0.5, 'rgba(88, 166, 255, 0.05)');
            gradient.addColorStop(1, 'rgba(88, 166, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        animationId = requestAnimationFrame(animate);
    }

    // Event listeners
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Touch support
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    });

    window.addEventListener('touchend', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Code tab switching
    const codeTabs = document.querySelectorAll('.code-tab');
    const codeBlocks = document.querySelectorAll('.code-content pre');

    codeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const lang = tab.dataset.lang;

            codeTabs.forEach(t => t.classList.remove('active'));
            codeBlocks.forEach(b => b.classList.remove('active'));

            tab.classList.add('active');
            document.querySelector(`.code-${lang}`).classList.add('active');
        });
    });

    // Copy button
    const copyBtn = document.querySelector('.code-copy');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const activeCode = document.querySelector('.code-content pre.active code');
            if (activeCode) {
                navigator.clipboard.writeText(activeCode.textContent).then(() => {
                    copyBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                    `;
                    setTimeout(() => {
                        copyBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                        `;
                    }, 2000);
                });
            }
        });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Header background on scroll
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            header.style.background = 'rgba(10, 12, 16, 0.95)';
        } else {
            header.style.background = 'rgba(10, 12, 16, 0.8)';
        }

        lastScroll = currentScroll;
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply initial styles and observe feature cards
    document.querySelectorAll('.feature-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease ${i * 0.1}s`;
        observer.observe(card);
    });

    // Start
    init();
    animate();

})();
