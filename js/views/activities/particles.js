import { AppState, DOM } from '../../state.js';
import { CONFIG, VIEWS } from '../../config.js';

function getDensityMultiplier() {
    return CONFIG.DENSITY_RICH_MULTIPLIER;
}

export const Particles = {
    
    spawn(x, y) {
        const goldenChance = CONFIG.PARTICLE_GOLDEN_CHANCE;
        const rainbowChance = CONFIG.PARTICLE_RAINBOW_CHANCE;
        const starChance = CONFIG.PARTICLE_STAR_CHANCE;
        
        let rand = Math.random();
        let type;
        if (rand < starChance) {
            type = CONFIG.PARTICLE_TYPES.STAR;
        } else if (rand < starChance + rainbowChance) {
            type = CONFIG.PARTICLE_TYPES.RAINBOW;
        } else if (rand < starChance + rainbowChance + goldenChance) {
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
            trail: []
        };
        
        AppState.entities.push(particle);
        
        const shouldBurst = type === CONFIG.PARTICLE_TYPES.GOLDEN || type === CONFIG.PARTICLE_TYPES.STAR;
            
        if (shouldBurst) {
            this.createBurst(x, y);
        }
    },
    
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
                hue: Math.random() * 60 + 180,
                size: Math.random() * 3 + 2,
                trail: []
            });
        }
    },
    
    checkConnections() {
        if (Math.random() >= CONFIG.EMERGENT_EVENT_CHANCE_COMMON) return;
        
        for (let i = 0; i < AppState.entities.length; i++) {
            for (let j = i + 1; j < AppState.entities.length; j++) {
                let p1 = AppState.entities[i], p2 = AppState.entities[j];
                let dx = p2.x - p1.x, dy = p2.y - p1.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < CONFIG.PARTICLE_CONNECTION_DISTANCE && dist > 20) {
                    DOM.ctx.beginPath();
                    DOM.ctx.moveTo(p1.x, p1.y);
                    DOM.ctx.lineTo(p2.x, p2.y);
                    DOM.ctx.strokeStyle = `rgba(255, 255, 255, ${p1.life * 0.3})`;
                    DOM.ctx.lineWidth = 1;
                    DOM.ctx.stroke();
                    return;
                }
            }
        }
    },
    
    drawParticle(p) {
        p.trail.forEach((pos, index) => {
            let trailAlpha = (index / p.trail.length) * p.life * 0.3;
            DOM.ctx.beginPath();
            DOM.ctx.arc(pos.x, pos.y, p.size * 0.5, 0, Math.PI * 2);
            DOM.ctx.fillStyle = `hsla(${p.hue},80%,60%,${trailAlpha})`;
            DOM.ctx.fill();
        });
        
        if (p.type === CONFIG.PARTICLE_TYPES.STAR) {
            this.drawStar(p.x, p.y, p.size, p.hue, p.life);
        } else if (p.type === CONFIG.PARTICLE_TYPES.GOLDEN) {
            this.drawGoldenParticle(p);
        } else if (p.type === CONFIG.PARTICLE_TYPES.RAINBOW) {
            this.drawRainbowParticle(p);
        } else {
            DOM.ctx.beginPath();
            DOM.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            DOM.ctx.fillStyle = `hsla(${p.hue},80%,60%,${p.life})`;
            DOM.ctx.fill();
        }
    },
    
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
    
    drawGoldenParticle(p) {
        let gradient = DOM.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `hsla(45,100%,70%,${p.life})`);
        gradient.addColorStop(0.5, `hsla(45,80%,50%,${p.life * 0.5})`);
        gradient.addColorStop(1, `hsla(45,60%,30%,0)`);
        
        DOM.ctx.beginPath();
        DOM.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        DOM.ctx.fillStyle = gradient;
        DOM.ctx.fill();
        
        DOM.ctx.beginPath();
        DOM.ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
        DOM.ctx.fillStyle = `hsla(45,100%,90%,${p.life})`;
        DOM.ctx.fill();
    },
    
    drawRainbowParticle(p) {
        let rainbowHue = (Date.now() / 20 + p.hue) % 360;
        
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
    
    update() {
        DOM.ctx.fillStyle = `rgba(5,5,5,${CONFIG.CANVAS_FADE_ALPHA})`;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        if (AppState.entities.length < 30) {
            if (Math.random() < 0.1) {
                this.spawn(
                    Math.random() * DOM.canvas.width,
                    Math.random() * DOM.canvas.height
                );
            }
        }
        
        this.checkConnections();
        
        for (let i = AppState.entities.length - 1; i >= 0; i--) {
            let p = AppState.entities[i];
            
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > CONFIG.PARTICLE_TRAIL_LENGTH) {
                p.trail.shift();
            }
            
            let chaosIntensity = 0.4;
            p.vx += (Math.random() - 0.5) * chaosIntensity;
            p.vy += (Math.random() - 0.5) * chaosIntensity;
            if (Math.random() < 0.02) {
                p.vx = (Math.random() - 0.5) * 5;
                p.vy = (Math.random() - 0.5) * 5;
            }
            
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.008;
            
            p.vx *= 0.98;
            p.vy *= 0.98;
            
            if (p.x < p.size || p.x > DOM.canvas.width - p.size) {
                p.vx *= -0.8;
                p.x = p.x < p.size ? p.size : DOM.canvas.width - p.size;
            }
            if (p.y < CONFIG.HEADER_HEIGHT + p.size || p.y > DOM.canvas.height - p.size) {
                p.vy *= -0.8;
                p.y = p.y < CONFIG.HEADER_HEIGHT + p.size ? CONFIG.HEADER_HEIGHT + p.size : DOM.canvas.height - p.size;
            }
            
            if (p.life <= 0) {
                AppState.entities.splice(i, 1);
                continue;
            }
            
            this.drawParticle(p);
        }
    }
};
