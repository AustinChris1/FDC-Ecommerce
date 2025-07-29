import React, { useRef, useEffect, useState, useCallback } from 'react';

const AnimatedBackground = () => {
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const lastScrollY = useRef(0);
    const scrollDirection = useRef(0);
    const particles = useRef([]);
    const numParticles = 100;
    const particleSpeed = 0.5;
    const mouseInfluenceRadius = 150;
    const mouseInfluenceStrength = 0.05;
    const scrollInfluenceStrength = 0.01;
    const particleLength = 20;

    // Touch handling
    const lastTouchY = useRef(0);
    const lastTapTime = useRef(0);
    const touchStartY = useRef(0);
    const isScrolling = useRef(false);

    const createParticle = useCallback((x, y, burst = false) => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const color = isDarkMode
            ? `rgba(100, 255, 200, ${Math.random() * 0.3 + 0.05})`
            : `rgba(173, 216, 230, ${Math.random() * 0.3 + 0.05})`;

        return {
            x: x || Math.random() * window.innerWidth,
            y: y || Math.random() * window.innerHeight,
            vx: burst ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 0.5,
            vy: burst ? (Math.random() - 0.5) * 4 : (Math.random() * 0.5 + 0.5) * particleSpeed,
            length: particleLength,
            opacity: Math.random() * 0.01 + 0.02,
            color,
        };
    }, []);

    const initParticles = useCallback(() => {
        if (!canvasRef.current) return;
        particles.current = [];
        for (let i = 0; i < numParticles; i++) {
            particles.current.push(createParticle());
        }
    }, [createParticle]);

    const splashAt = useCallback((x, y) => {
        for (let i = 0; i < 30; i++) {
            particles.current.push(createParticle(x, y, true));
        }
    }, [createParticle]);

    const updateParticles = useCallback((ctx) => {
        if (!ctx) return;
        const isDarkMode = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDarkMode ? 'rgba(17, 24, 39, 0.05)' : 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Scroll up = erase nearby particles
        if (scrollDirection.current === -1) {
            particles.current = particles.current.filter(p => {
                const dx = mouse.current.x - p.x;
                const dy = mouse.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                return dist > 40; // Remove particles close to mouse/touch
            });
        }

        particles.current.forEach(p => {
            // Mouse/touch attract on scroll down
            if (scrollDirection.current === 1) {
                const dx = mouse.current.x - p.x;
                const dy = mouse.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouseInfluenceRadius) {
                    const force = mouseInfluenceStrength * (1 - dist / mouseInfluenceRadius);
                    p.vx += dx * force;
                    p.vy += dy * force;
                }
            }

            // Scroll vertical influence
            p.vy += scrollDirection.current * scrollInfluenceStrength;

            // Friction
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Recycle particle
            if (
                p.y > ctx.canvas.height + p.length ||
                p.y < -p.length ||
                p.x > ctx.canvas.width + p.length ||
                p.x < -p.length
            ) {
                if (scrollDirection.current === 1) {
                    Object.assign(p, createParticle(Math.random() * ctx.canvas.width, -p.length));
                } else if (scrollDirection.current === -1) {
                    Object.assign(p, createParticle(Math.random() * ctx.canvas.width, ctx.canvas.height + p.length));
                } else {
                    Object.assign(p, createParticle());
                }
            }

            // Draw
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            const endX = p.x + p.vx * p.length / 5;
            const endY = p.y + p.vy * p.length / 5;
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = p.opacity;
            ctx.stroke();
        });
    }, [createParticle]);

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            animationFrameId.current = null;
            return;
        }
        const ctx = canvas.getContext('2d');
        updateParticles(ctx);
        animationFrameId.current = requestAnimationFrame(animate);
    }, [updateParticles]);

    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY.current) {
            scrollDirection.current = 1;
        } else if (currentScrollY < lastScrollY.current) {
            scrollDirection.current = -1;
        } else {
            scrollDirection.current = 0;
        }
        lastScrollY.current = currentScrollY;
    }, []);

    const handleTouchStart = useCallback((e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchStartY.current = touch.clientY;
            lastTouchY.current = touch.clientY;
            mouse.current = { x: touch.clientX, y: touch.clientY };
            isScrolling.current = false;
        }
    }, []);

    const handleTouchMove = useCallback((e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const currentY = touch.clientY;
            const deltaY = currentY - lastTouchY.current;
            
            // Update mouse position for particle interactions
            mouse.current = { x: touch.clientX, y: touch.clientY };
            
            // Determine scroll direction based on touch movement
            if (Math.abs(deltaY) > 5) { // Threshold to avoid jitter
                isScrolling.current = true;
                if (deltaY < 0) {
                    scrollDirection.current = 1; // Scrolling down (swiping up)
                } else {
                    scrollDirection.current = -1; // Scrolling up (swiping down)
                }
            }
            
            lastTouchY.current = currentY;
        }
    }, []);

    const handleTouchEnd = useCallback((e) => {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapTime.current;
        
        // Check for double tap (within 400ms and not scrolling)
        if (timeSinceLastTap < 400 && timeSinceLastTap > 50 && !isScrolling.current) {
            const touch = e.changedTouches[0];
            splashAt(touch.clientX, touch.clientY);
        }
        
        lastTapTime.current = now;
        
        // Reset scroll direction after a delay
        setTimeout(() => {
            scrollDirection.current = 0;
        }, 100);
    }, [splashAt]);

    const handleMouseMove = useCallback((e) => {
        mouse.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleDoubleClick = useCallback((e) => {
        splashAt(e.clientX, e.clientY);
    }, [splashAt]);

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        handleResize();
        
        // Event listeners
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);
        
        // Mouse events for desktop
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('dblclick', handleDoubleClick);
        
        // Touch events for mobile
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        animationFrameId.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('dblclick', handleDoubleClick);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            animationFrameId.current = null;
        };
    }, [animate, initParticles, handleScroll, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseMove, handleDoubleClick]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full z-[0] pointer-events-none"
            style={{ isolation: 'isolate' }}
        />
    );
};

export default AnimatedBackground;