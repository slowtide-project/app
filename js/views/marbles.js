import { AppState, DOM } from '../state.js';
import { CONFIG } from '../config.js';
import { SFX } from '../audio.js';

// Helper function to get density multiplier
function getDensityMultiplier() {
    switch(AppState.visualDensity) {
        case 'minimal': return CONFIG.DENSITY_MINIMAL_MULTIPLIER;
        case 'rich': return CONFIG.DENSITY_RICH_MULTIPLIER;
        default: return CONFIG.DENSITY_STANDARD_MULTIPLIER;
    }
}

// 5. MARBLES VIEW
export const Marbles = {
    /**
     * Initialize marbles
     */
    init() {
        let marbleCount = Math.floor(CONFIG.MARBLE_COUNT * getDensityMultiplier());
        for (let i = 0; i < marbleCount; i++) {
            AppState.entities.push({
                x: Math.random() * DOM.canvas.width, 
                y: Math.random() * DOM.canvas.height, 
                vx: (Math.random() - .5) * 2, 
                vy: (Math.random() - .5) * 2, 
                r: Math.random() * 15 + 15, 
                c: `hsl(${Math.random() * 360},60%,60%)`
            });
        }
    },

    /**
     * Handle marble interaction
     */
    handleInput(x, y) {
        AppState.entities.forEach(m => {
            let dx = m.x - x, dy = m.y - y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < CONFIG.MARBLE_INTERACTION_RADIUS) { 
                let f = (CONFIG.MARBLE_INTERACTION_RADIUS - d) / CONFIG.MARBLE_INTERACTION_RADIUS, a = Math.atan2(dy, dx); 
                m.vx += Math.cos(a) * f * CONFIG.MARBLE_INTERACTION_FORCE; 
                m.vy += Math.sin(a) * f * CONFIG.MARBLE_INTERACTION_FORCE; 
            }
        });
    },

    /**
     * Check for and handle marble clustering (emergent event)
     */
    checkClustering() {
        if (AppState.emergentEvents === 'off') return;
        let chance = AppState.emergentEvents === 'rare' ? 
            CONFIG.EMERGENT_EVENT_CHANCE_RARE : CONFIG.EMERGENT_EVENT_CHANCE_COMMON;
        
        if (Math.random() >= chance) return;
        
        // Occasionally give all marbles a gentle push toward center
        let centerX = DOM.canvas.width / 2;
        let centerY = (DOM.canvas.height + CONFIG.HEADER_HEIGHT) / 2;
        
        AppState.entities.forEach(m => {
            let dx = centerX - m.x, dy = centerY - m.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 50) {
                m.vx += (dx / dist) * 0.3;
                m.vy += (dy / dist) * 0.3;
            }
        });
    },

    /**
     * Update marble physics
     */
    update() {
        DOM.ctx.fillStyle = 'rgba(5,5,5,0.3)'; 
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Check for emergent events
        this.checkClustering();
        
        for (let i = 0; i < AppState.entities.length; i++) {
            let m = AppState.entities[i]; 
            m.x += m.vx; m.y += m.vy; m.vx *= CONFIG.MARBLE_DAMPING; m.vy *= CONFIG.MARBLE_DAMPING;

            if (m.x < m.r || m.x > DOM.canvas.width - m.r) { 
                m.vx *= -CONFIG.MARBLE_BOUNCE_DAMPING; SFX.play('clack'); 
            }
            if (m.y < m.r + CONFIG.HEADER_HEIGHT || m.y > DOM.canvas.height - m.r) { 
                m.vy *= -CONFIG.MARBLE_BOUNCE_DAMPING; SFX.play('clack'); 
            }

            if (m.x < m.r) m.x = m.r; 
            if (m.x > DOM.canvas.width - m.r) m.x = DOM.canvas.width - m.r;
            if (m.y < m.r + CONFIG.HEADER_HEIGHT) m.y = m.r + CONFIG.HEADER_HEIGHT; 
            if (m.y > DOM.canvas.height - m.r) m.y = DOM.canvas.height - m.r;

            for (let j = i + 1; j < AppState.entities.length; j++) {
                let m2 = AppState.entities[j], dx = m2.x - m.x, dy = m2.y - m.y, 
                    d = Math.sqrt(dx * dx + dy * dy), minD = m.r + m2.r;
                if (d < minD) {
                    let a = Math.atan2(dy, dx), tx = m.x + Math.cos(a) * minD, ty = m.y + Math.sin(a) * minD;
                    let ax = (tx - m2.x) * CONFIG.MARBLE_COLLISION_RESOLUTION, ay = (ty - m2.y) * CONFIG.MARBLE_COLLISION_RESOLUTION; 
                    m.vx -= ax; m.vy -= ay; m2.vx += ax; m2.vy += ay;
                    SFX.play('clack');
                }
            }
            DOM.ctx.beginPath(); 
            DOM.ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); 
            DOM.ctx.fillStyle = m.c; 
            DOM.ctx.fill(); 
            DOM.ctx.strokeStyle = "rgba(255,255,255,0.2)"; 
            DOM.ctx.lineWidth = 2; 
            DOM.ctx.stroke();
        }
    }
};