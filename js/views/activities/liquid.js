import { AppState, DOM } from '../../state.js';
import { CONFIG } from '../../config.js';

// 4. LIQUID VIEW - Simple elegant version
export const Liquid = {
    orbitPhase: 0,
    
    /**
     * Spawn liquid effect at position
     */
    spawn(x, y) { 
        const isHighIntensity = AppState.sensoryDimmerMode !== 'off' && 
            AppState.currentEngagementPhase === 'high';
        
        const ringCount = isHighIntensity ? CONFIG.HIGH_INTENSITY_LIQUID_RIPPLE_COUNT : 6;
        const rainbowSpeed = isHighIntensity ? CONFIG.HIGH_INTENSITY_LIQUID_RAINBOW_SPEED : 1;
        
        // Create expanding circles
        for (let r = 5; r <= 30; r += 5) {
            setTimeout(() => {
                DOM.ctx.beginPath(); 
                DOM.ctx.arc(x, y, r, 0, Math.PI * 2); 
                DOM.ctx.strokeStyle = `hsla(${(Date.now() + r * 10 * rainbowSpeed) % 360},70%,60%,${1 - r/30})`; 
                DOM.ctx.lineWidth = 2;
                DOM.ctx.stroke();
            }, (r - 5) * 30);
        }
        
        // Add extra rainbow rings in high intensity mode
        if (isHighIntensity) {
            for (let r = 35; r <= 60; r += 5) {
                setTimeout(() => {
                    DOM.ctx.beginPath(); 
                    DOM.ctx.arc(x, y, r, 0, Math.PI * 2); 
                    DOM.ctx.strokeStyle = `hsla(${(Date.now() + r * 15) % 360},80%,70%,${1 - r/60})`; 
                    DOM.ctx.lineWidth = 3;
                    DOM.ctx.stroke();
                }, (r - 5) * 25);
            }
        }
    },

    /**
     * Handle touch/click interaction
     */
    handleStart(x, y) {
        const isHighIntensity = AppState.sensoryDimmerMode !== 'off' && 
            AppState.currentEngagementPhase === 'high';
        
        // Create multiple expanding rings
        this.spawn(x, y);
        
        // Add random nearby drops for variety
        const dropCount = isHighIntensity ? CONFIG.HIGH_INTENSITY_LIQUID_NEARBY_DROPS : 3;
        for (let i = 0; i < dropCount; i++) {
            setTimeout(() => {
                let offsetX = (Math.random() - 0.5) * 100;
                let offsetY = (Math.random() - 0.5) * 100;
                this.spawn(x + offsetX, y + offsetY);
            }, i * 100);
        }
    },

    /**
     * Check for and handle spontaneous ripples (emergent event)
     */
    checkSpontaneousRipples() {
        if (AppState.emergentEvents === 'off') return;
        
        const isHighIntensity = AppState.sensoryDimmerMode !== 'off' && 
            AppState.currentEngagementPhase === 'high';
        
        let chance = AppState.emergentEvents === 'rare' ? 
            CONFIG.EMERGENT_EVENT_CHANCE_RARE : CONFIG.EMERGENT_EVENT_CHANCE_COMMON;
        
        // Boost spontaneous ripples in high intensity mode
        if (isHighIntensity) {
            chance = Math.max(chance, CONFIG.HIGH_INTENSITY_LIQUID_SPONTANEOUS_CHANCE);
        }
        
        if (Math.random() >= chance) return;
        
        // Create spontaneous ripple at random location
        let x = Math.random() * DOM.canvas.width;
        let y = Math.random() * DOM.canvas.height;
        this.createRipple(x, y);
    },

    /**
     * Create ripple effect at position
     */
    createRipple(x, y) {
        for (let r = 10; r <= 50; r += 10) {
            setTimeout(() => {
                DOM.ctx.beginPath(); 
                DOM.ctx.arc(x, y, r, 0, Math.PI * 2); 
                DOM.ctx.strokeStyle = `hsla(${(Date.now() + r * 5) % 360},70%,60%,${0.8 - r/60})`; 
                DOM.ctx.lineWidth = 3;
                DOM.ctx.stroke();
            }, (r - 10) * 40);
        }
    },

    /**
     * Update liquid animation
     */
    update() {
        DOM.ctx.fillStyle = `rgba(5,5,5,${CONFIG.LIQUID_FADE_ALPHA})`; 
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Check for emergent events
        this.checkSpontaneousRipples();
        
        const isHighIntensity = AppState.sensoryDimmerMode !== 'off' && 
            AppState.currentEngagementPhase === 'high';
        
        // High-intensity flash effects
        if (isHighIntensity && Math.random() < CONFIG.HIGH_INTENSITY_LIQUID_FLASH_CHANCE) {
            this.createFlashEffect();
        }
        
        // Orbiting drops with high-intensity mode
        const orbitSpeed = isHighIntensity ? CONFIG.HIGH_INTENSITY_LIQUID_ORBIT_SPEED : 0.01;
        const orbitCount = isHighIntensity ? CONFIG.HIGH_INTENSITY_LIQUID_ORBIT_COUNT : 3;
        
        this.orbitPhase += orbitSpeed;
        
        // Store trail positions for high intensity
        if (isHighIntensity && !this.trails) this.trails = [];
        
        for (let i = 0; i < orbitCount; i++) {
            let offsetPhase = this.orbitPhase + (i * Math.PI * 2 / orbitCount);
            let radiusX = (DOM.canvas.width / 3) * (1 + i * 0.1);
            let radiusY = (DOM.canvas.height / 4) * (1 + i * 0.1);
            let dropX = DOM.canvas.width / 2 + Math.sin(offsetPhase) * radiusX;
            let dropY = DOM.canvas.height / 2 + Math.cos(offsetPhase * 1.3) * radiusY;
            let dropSize = isHighIntensity ? 20 + i * 3 : 25 - i * 5;
            
            // Add trail effect in high intensity mode
            if (isHighIntensity) {
                if (!this.trails[i]) this.trails[i] = [];
                this.trails[i].push({ x: dropX, y: dropY });
                if (this.trails[i].length > CONFIG.HIGH_INTENSITY_LIQUID_TRAIL_LENGTH) {
                    this.trails[i].shift();
                }
                
                // Draw trail
                this.trails[i].forEach((pos, index) => {
                    let trailAlpha = (index / this.trails[i].length) * 0.3;
                    let trailSize = dropSize * (index / this.trails[i].length) * 0.5;
                    DOM.ctx.beginPath();
                    DOM.ctx.arc(pos.x, pos.y, trailSize, 0, Math.PI * 2);
                    DOM.ctx.fillStyle = `hsla(${(Date.now() + i * 100) % 360},80%,70%,${trailAlpha})`;
                    DOM.ctx.fill();
                });
            }
            
            // Draw main drop
            DOM.ctx.beginPath(); 
            DOM.ctx.arc(dropX, dropY, dropSize, 0, Math.PI * 2); 
            
            if (isHighIntensity) {
                // Rainbow animated colors
                let rainbowHue = (Date.now() / 10 + i * 100) % 360;
                DOM.ctx.fillStyle = `hsl(${rainbowHue},80%,70%)`;
                DOM.ctx.shadowBlur = 40;
                DOM.ctx.shadowColor = DOM.ctx.fillStyle;
            } else {
                DOM.ctx.fillStyle = `hsl(${(Date.now() + i * 100) % 360},70%,60%)`; 
                DOM.ctx.shadowBlur = 30; 
                DOM.ctx.shadowColor = DOM.ctx.fillStyle;
            }
            
            DOM.ctx.fill(); 
            DOM.ctx.shadowBlur = 0;
            
            // Create ripples from drops in high intensity mode
            if (isHighIntensity && Math.random() < 0.02) {
                this.createRipple(dropX, dropY);
            }
        }
    },
    
    /**
     * Create full-screen flash effect for high intensity
     */
    createFlashEffect() {
        const flashAlpha = 0.2;
        DOM.ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Create multiple spontaneous ripples from flash
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                let x = Math.random() * DOM.canvas.width;
                let y = Math.random() * DOM.canvas.height;
                this.createRipple(x, y);
            }, i * 100);
        }
    }
};