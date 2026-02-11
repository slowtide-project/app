import { AppState, DOM } from '../state.js';
import { CONFIG, VIEWS } from '../config.js';

// Helper function to get density multiplier
function getDensityMultiplier() {
    switch(AppState.visualDensity) {
        case 'minimal': return CONFIG.DENSITY_MINIMAL_MULTIPLIER;
        case 'rich': return CONFIG.DENSITY_RICH_MULTIPLIER;
        default: return CONFIG.DENSITY_STANDARD_MULTIPLIER;
    }
}

// 1. PARTICLES VIEW - Enhanced version
export const Particles = {
    
    /**
     * Spawn a new particle at position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    spawn(x, y) {
        // Determine particle type
        let rand = Math.random();
        let type;
        if (rand < CONFIG.PARTICLE_STAR_CHANCE) {
            type = CONFIG.PARTICLE_TYPES.STAR;
        } else if (rand < CONFIG.PARTICLE_STAR_CHANCE + CONFIG.PARTICLE_RAINBOW_CHANCE) {
            type = CONFIG.PARTICLE_TYPES.RAINBOW;
        } else if (rand < CONFIG.PARTICLE_STAR_CHANCE + CONFIG.PARTICLE_RAINBOW_CHANCE + CONFIG.PARTICLE_GOLDEN_CHANCE) {
            type = CONFIG.PARTICLE_TYPES.GOLDEN;
        } else {
            type = CONFIG.PARTICLE_TYPES.NORMAL;
        }
        
        let particle = {
            type: type,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 1,
            hue: CONFIG.PARTICLE_HUE_RANGE.MIN + Math.random() * 
                (CONFIG.PARTICLE_HUE_RANGE.MAX - CONFIG.PARTICLE_HUE_RANGE.MIN),
            size: Math.random() * 10 + 5,
            trail: [] // Store previous positions for trail effect
        };
        
        AppState.entities.push(particle);
        
        // Create particle burst effect for special types
        if (type === CONFIG.PARTICLE_TYPES.GOLDEN || type === CONFIG.PARTICLE_TYPES.STAR) {
            this.createBurst(x, y);
        }
    },
    
    /**
     * Create burst of small particles
     */
    createBurst(x, y) {
        for (let i = 0; i < CONFIG.PARTICLE_BURST_COUNT; i++) {
            let angle = (Math.PI * 2 * i) / CONFIG.PARTICLE_BURST_COUNT;
            AppState.entities.push({
                type: CONFIG.PARTICLE_TYPES.NORMAL,
                x: x,
                y: y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 0.5,
                hue: Math.random() * 60 + 180, // Blue-purple range
                size: Math.random() * 3 + 2,
                trail: []
            });
        }
    },
    
    /**
     * Check for particle connections (emergent event)
     */
    checkConnections() {
        if (AppState.emergentEvents === 'off') return;
        
        let chance = AppState.emergentEvents === 'rare' ? 
            CONFIG.EMERGENT_EVENT_CHANCE_RARE : CONFIG.EMERGENT_EVENT_CHANCE_COMMON;
        
        if (Math.random() >= chance) return;
        
        // Find nearby particles and connect them
        for (let i = 0; i < AppState.entities.length; i++) {
            for (let j = i + 1; j < AppState.entities.length; j++) {
                let p1 = AppState.entities[i], p2 = AppState.entities[j];
                let dx = p2.x - p1.x, dy = p2.y - p1.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < CONFIG.PARTICLE_CONNECTION_DISTANCE && dist > 20) {
                    // Draw connection between particles
                    DOM.ctx.beginPath();
                    DOM.ctx.moveTo(p1.x, p1.y);
                    DOM.ctx.lineTo(p2.x, p2.y);
                    DOM.ctx.strokeStyle = `rgba(255, 255, 255, ${p1.life * 0.3})`;
                    DOM.ctx.lineWidth = 1;
                    DOM.ctx.stroke();
                    return; // Only one connection per frame
                }
            }
        }
    },
    
    /**
     * Draw particle based on type
     */
    drawParticle(p) {
        // Draw trail first
        p.trail.forEach((pos, index) => {
            let trailAlpha = (index / p.trail.length) * p.life * 0.3;
            DOM.ctx.beginPath();
            DOM.ctx.arc(pos.x, pos.y, p.size * 0.5, 0, Math.PI * 2);
            DOM.ctx.fillStyle = `hsla(${p.hue},80%,60%,${trailAlpha})`;
            DOM.ctx.fill();
        });
        
        // Draw main particle
        if (p.type === CONFIG.PARTICLE_TYPES.STAR) {
            this.drawStar(p.x, p.y, p.size, p.hue, p.life);
        } else if (p.type === CONFIG.PARTICLE_TYPES.GOLDEN) {
            this.drawGoldenParticle(p);
        } else if (p.type === CONFIG.PARTICLE_TYPES.RAINBOW) {
            this.drawRainbowParticle(p);
        } else {
            // Normal particle
            DOM.ctx.beginPath();
            DOM.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            DOM.ctx.fillStyle = `hsla(${p.hue},80%,60%,${p.life})`;
            DOM.ctx.fill();
        }
    },
    
    /**
     * Draw star-shaped particle
     */
    drawStar(x, y, size, hue, alpha) {
        DOM.ctx.save();
        DOM.ctx.translate(x, y);
        DOM.ctx.rotate(Date.now() * 0.001);
        
        DOM.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            let angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            let outerX = Math.cos(angle) * size;
            let outerY = Math.sin(angle) * size;
            let innerAngle = angle + Math.PI / 5;
            let innerX = Math.cos(innerAngle) * size * 0.5;
            let innerY = Math.sin(innerAngle) * size * 0.5;
            
            if (i === 0) {
                DOM.ctx.moveTo(outerX, outerY);
            } else {
                DOM.ctx.lineTo(outerX, outerY);
            }
            DOM.ctx.lineTo(innerX, innerY);
        }
        DOM.ctx.closePath();
        
        DOM.ctx.fillStyle = `hsla(${(Date.now() / 10) % 360},80%,70%,${alpha})`;
        DOM.ctx.shadowBlur = CONFIG.PARTICLE_GLOW_RADIUS;
        DOM.ctx.shadowColor = DOM.ctx.fillStyle;
        DOM.ctx.fill();
        DOM.ctx.shadowBlur = 0;
        DOM.ctx.restore();
    },
    
    /**
     * Draw golden glowing particle
     */
    drawGoldenParticle(p) {
        // Outer glow
        let gradient = DOM.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `hsla(45,100%,70%,${p.life})`);
        gradient.addColorStop(0.5, `hsla(45,80%,50%,${p.life * 0.5})`);
        gradient.addColorStop(1, `hsla(45,60%,30%,0)`);
        
        DOM.ctx.beginPath();
        DOM.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        DOM.ctx.fillStyle = gradient;
        DOM.ctx.fill();
        
        // Inner bright core
        DOM.ctx.beginPath();
        DOM.ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        DOM.ctx.fillStyle = `hsla(45,100%,90%,${p.life})`;
        DOM.ctx.fill();
    },
    
    /**
     * Draw color-shifting rainbow particle
     */
    drawRainbowParticle(p) {
        let rainbowHue = (Date.now() / 20 + p.hue) % 360;
        
        // Outer rainbow gradient
        let gradient = DOM.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `hsla(${rainbowHue},80%,70%,${p.life})`);
        gradient.addColorStop(1, `hsla(${(rainbowHue + 60) % 360},70%,50%,${p.life * 0.5})`);
        
        DOM.ctx.beginPath();
        DOM.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        DOM.ctx.fillStyle = gradient;
        DOM.ctx.shadowBlur = CONFIG.PARTICLE_GLOW_RADIUS;
        DOM.ctx.shadowColor = `hsla(${rainbowHue},80%,60%,${p.life})`;
        DOM.ctx.fill();
        DOM.ctx.shadowBlur = 0;
    },
    
    /**
     * Update and render particles
     */
    update() {
        DOM.ctx.fillStyle = `rgba(5,5,5,${CONFIG.CANVAS_FADE_ALPHA})`;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Auto-spawn particles in chaos mode to maintain activity
        if (AppState.behaviorPattern === 'chaos' && AppState.entities.length < 20) {
            if (Math.random() < 0.1) { // 10% chance per frame
                this.spawn(
                    Math.random() * DOM.canvas.width,
                    Math.random() * DOM.canvas.height
                );
            }
        }
        
        // Calculate time-based rhythm phase
        let timePhase = (AppState.behaviorPattern === 'rhythm' || AppState.behaviorPattern === 'mix') ? 
            Date.now() * CONFIG.RHYTHM_MODE_SPEED : null;
        
        // Check for emergent connections
        this.checkConnections();
        
        // Update and draw particles
        for (let i = AppState.entities.length - 1; i >= 0; i--) {
            let p = AppState.entities[i];
            
            // Update trail
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > CONFIG.PARTICLE_TRAIL_LENGTH) {
                p.trail.shift();
            }
            
            // Apply behavior patterns
            if (AppState.behaviorPattern === 'chaos') {
                // Chaotic movement - strong random forces and erratic changes
                let chaosIntensity = 0.4;
                p.vx += (Math.random() - 0.5) * chaosIntensity;
                p.vy += (Math.random() - 0.5) * chaosIntensity;
                // Add occasional sudden direction changes
                if (Math.random() < 0.02) {
                    p.vx = (Math.random() - 0.5) * 5;
                    p.vy = (Math.random() - 0.5) * 5;
                }
            } else if (timePhase !== null) {
                if (AppState.behaviorPattern === 'rhythm') {
                    // Rhythmic flowing movement
                    p.vx += Math.sin(timePhase + i) * 0.1;
                    p.vy += Math.cos(timePhase * 1.5 + i) * 0.1;
                } else if (AppState.behaviorPattern === 'mix') {
                    // Mix mode - alternate between rhythm and calm
                    let cycleProgress = (Date.now() % CONFIG.MIX_PATTERN_CYCLE_TIME) / CONFIG.MIX_PATTERN_CYCLE_TIME;
                    if (cycleProgress < 0.6) {
                        // Rhythmic period
                        p.vx += Math.sin(timePhase + i) * 0.1;
                        p.vy += Math.cos(timePhase * 1.5 + i) * 0.1;
                    } else {
                        // Calm period
                        p.vx += (Math.random() - 0.5) * 0.1;
                        p.vy += (Math.random() - 0.5) * 0.1;
                    }
                } else {
                    // Default gentle floating
                    p.vx += (Math.random() - 0.5) * 0.2;
                    p.vy += (Math.random() - 0.5) * 0.2;
                }
            }
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.008;
            
            // Apply damping
            p.vx *= 0.98;
            p.vy *= 0.98;
            
            // Boundary soft bouncing
            if (p.x < p.size || p.x > DOM.canvas.width - p.size) {
                p.vx *= -0.8;
                p.x = p.x < p.size ? p.size : DOM.canvas.width - p.size;
            }
            if (p.y < CONFIG.HEADER_HEIGHT + p.size || p.y > DOM.canvas.height - p.size) {
                p.vy *= -0.8;
                p.y = p.y < CONFIG.HEADER_HEIGHT + p.size ? CONFIG.HEADER_HEIGHT + p.size : DOM.canvas.height - p.size;
            }
            
            // Remove dead particles
            if (p.life <= 0) {
                AppState.entities.splice(i, 1);
                continue;
            }
            
            // Draw particle
            this.drawParticle(p);
        }
    }
};