// =========================================================================
// Night Sky view - Simple calming night scene for story mode
// =========================================================================

import { AppState, DOM } from '../../state.js';
import { CONFIG } from '../../config.js';

export const Night = {
    init() {
        this.drawNight();
    },
    
    handleStart(x, y) {
        return;
    },
    
    handleMove(x, y) {
        return;
    },
    
    update() {
        // Static scene - no updates needed
    },
    
    redraw() {
        this.drawNight();
    },
    
    drawNight() {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        this.drawSky();
        this.drawStars();
        this.drawMoon();
        this.drawHorizon();
        this.drawGround();
    },
    
    drawSky() {
        // Dark night sky with super moon glow
        const gradient = DOM.ctx.createLinearGradient(0, 0, 0, DOM.canvas.height * 0.7);
        gradient.addColorStop(0, '#101025');    // Slightly lighter from moon glow
        gradient.addColorStop(0.3, '#0A0A18');  // Dark blue
        gradient.addColorStop(0.6, '#0F0F20');  // Dark purple-blue
        gradient.addColorStop(1, '#181830');     // Lighter at horizon from moon
        
        DOM.ctx.fillStyle = gradient;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Super moon glow in sky - very bright
        const moonX = DOM.canvas.width * 0.78;
        const moonY = DOM.canvas.height * 0.18;
        
        // Large outer glow
        const outerGlow = DOM.ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 400);
        outerGlow.addColorStop(0, 'rgba(255, 250, 220, 0.4)');
        outerGlow.addColorStop(0.2, 'rgba(255, 245, 210, 0.25)');
        outerGlow.addColorStop(0.5, 'rgba(255, 240, 200, 0.1)');
        outerGlow.addColorStop(1, 'rgba(255, 235, 190, 0)');
        
        DOM.ctx.fillStyle = outerGlow;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Medium glow
        const mediumGlow = DOM.ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 200);
        mediumGlow.addColorStop(0, 'rgba(255, 252, 240, 0.6)');
        mediumGlow.addColorStop(0.5, 'rgba(255, 248, 230, 0.3)');
        mediumGlow.addColorStop(1, 'rgba(255, 245, 220, 0)');
        
        DOM.ctx.fillStyle = mediumGlow;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Subtle horizon glow from moon
        const horizonGlow = DOM.ctx.createRadialGradient(
            DOM.canvas.width * 0.5, DOM.canvas.height, 0,
            DOM.canvas.width * 0.5, DOM.canvas.height, DOM.canvas.width * 0.8
        );
        horizonGlow.addColorStop(0, 'rgba(40, 40, 60, 0.2)');
        horizonGlow.addColorStop(0.5, 'rgba(30, 30, 50, 0.1)');
        horizonGlow.addColorStop(1, 'rgba(20, 20, 40, 0)');
        
        DOM.ctx.fillStyle = horizonGlow;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    },
    
    drawStars() {
        // Static stars - scattered across sky
        for (let i = 0; i < 80; i++) {
            const x = Math.random() * DOM.canvas.width;
            const y = Math.random() * DOM.canvas.height * 0.6;
            const size = 0.5 + Math.random() * 1.5;
            
            // Varying brightness
            const brightness = 0.3 + Math.random() * 0.7;
            
            DOM.ctx.fillStyle = `rgba(255, 255, 240, ${brightness})`;
            DOM.ctx.beginPath();
            DOM.ctx.arc(x, y, size, 0, Math.PI * 2);
            DOM.ctx.fill();
        }
        
        // A few brighter stars
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * DOM.canvas.width;
            const y = Math.random() * DOM.canvas.height * 0.5;
            const size = 1.5 + Math.random() * 1;
            
            // Star glow
            const glowGrad = DOM.ctx.createRadialGradient(x, y, 0, x, y, size * 4);
            glowGrad.addColorStop(0, 'rgba(255, 255, 250, 0.4)');
            glowGrad.addColorStop(0.5, 'rgba(255, 255, 240, 0.1)');
            glowGrad.addColorStop(1, 'rgba(255, 255, 230, 0)');
            
            DOM.ctx.fillStyle = glowGrad;
            DOM.ctx.fillRect(x - size * 4, y - size * 4, size * 8, size * 8);
            
            // Star core
            DOM.ctx.fillStyle = 'rgba(255, 255, 250, 0.9)';
            DOM.ctx.beginPath();
            DOM.ctx.arc(x, y, size, 0, Math.PI * 2);
            DOM.ctx.fill();
        }
    },
    
    drawMoon() {
        // Super moon - much bigger and brighter
        const moonX = DOM.canvas.width * 0.78;
        const moonY = DOM.canvas.height * 0.18;
        const moonRadius = 50; // Much bigger than before (was 25)
        
        // Outer glow - very bright
        const outerGlow = DOM.ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 6);
        outerGlow.addColorStop(0, 'rgba(255, 250, 230, 0.5)');
        outerGlow.addColorStop(0.3, 'rgba(255, 245, 220, 0.3)');
        outerGlow.addColorStop(0.6, 'rgba(255, 240, 210, 0.15)');
        outerGlow.addColorStop(1, 'rgba(255, 235, 200, 0)');
        
        DOM.ctx.fillStyle = outerGlow;
        DOM.ctx.fillRect(moonX - moonRadius * 6, moonY - moonRadius * 6, moonRadius * 12, moonRadius * 12);
        
        // Inner glow
        const innerGlow = DOM.ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 3);
        innerGlow.addColorStop(0, 'rgba(255, 252, 245, 0.7)');
        innerGlow.addColorStop(0.5, 'rgba(255, 248, 235, 0.4)');
        innerGlow.addColorStop(1, 'rgba(255, 245, 225, 0)');
        
        DOM.ctx.fillStyle = innerGlow;
        DOM.ctx.fillRect(moonX - moonRadius * 3, moonY - moonRadius * 3, moonRadius * 6, moonRadius * 6);
        
        // Moon body - more natural cream/yellow color
        DOM.ctx.fillStyle = 'rgba(255, 248, 230, 0.85)';
        DOM.ctx.beginPath();
        DOM.ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        DOM.ctx.fill();
        
        // Subtle surface glow
        const surfaceGlow = DOM.ctx.createRadialGradient(
            moonX - moonRadius * 0.3, moonY - moonRadius * 0.3, 0,
            moonX, moonY, moonRadius
        );
        surfaceGlow.addColorStop(0, 'rgba(255, 252, 245, 0.3)');
        surfaceGlow.addColorStop(1, 'rgba(255, 250, 240, 0)');
        
        DOM.ctx.fillStyle = surfaceGlow;
        DOM.ctx.beginPath();
        DOM.ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        DOM.ctx.fill();
        
        // Subtle craters (more visible now)
        DOM.ctx.fillStyle = 'rgba(230, 220, 200, 0.15)';
        const craters = [
            { x: -10, y: -8, r: 6 },
            { x: 15, y: 10, r: 5 },
            { x: -8, y: 15, r: 4 },
            { x: 10, y: -12, r: 4 },
            { x: 18, y: 5, r: 3 }
        ];
        
        craters.forEach(crater => {
            DOM.ctx.beginPath();
            DOM.ctx.arc(moonX + crater.x, moonY + crater.y, crater.r, 0, Math.PI * 2);
            DOM.ctx.fill();
        });
    },
    
    drawHorizon() {
        // Dark tree silhouettes at horizon
        const horizonY = DOM.canvas.height * 0.55;
        
        // Far trees - very dark
        for (let i = 0; i < 50; i++) {
            const x = (i / 50) * DOM.canvas.width * 1.1 - DOM.canvas.width * 0.05;
            const height = 40 + Math.random() * 40;
            const width = 25 + Math.random() * 20;
            
            DOM.ctx.fillStyle = '#0A0A12';
            this.drawTreeSilhouette(x, horizonY, width, height);
        }
        
        // Fill gaps
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * DOM.canvas.width;
            const height = 30 + Math.random() * 30;
            const width = 18 + Math.random() * 15;
            
            DOM.ctx.fillStyle = '#08080E';
            this.drawTreeSilhouette(x, horizonY + Math.random() * 20, width, height);
        }
        
        // Closer trees - slightly lighter dark
        for (let i = 0; i < 30; i++) {
            const x = (i / 30) * DOM.canvas.width * 1.08 - DOM.canvas.width * 0.04;
            const height = 70 + Math.random() * 50;
            const width = 45 + Math.random() * 30;
            
            DOM.ctx.fillStyle = '#0C0C14';
            this.drawTreeSilhouette(x, horizonY + 10, width, height);
        }
    },
    
    drawTreeSilhouette(x, baseY, width, height) {
        // Simple triangular pine silhouette
        const layers = 4;
        
        for (let i = 0; i < layers; i++) {
            const layerY = baseY - (i * height * 0.22);
            const layerWidth = width * (1 - i * 0.22);
            const layerHeight = height * 0.35;
            
            DOM.ctx.beginPath();
            DOM.ctx.moveTo(x, layerY - layerHeight);
            DOM.ctx.lineTo(x - layerWidth / 2, layerY);
            DOM.ctx.lineTo(x + layerWidth / 2, layerY);
            DOM.ctx.closePath();
            DOM.ctx.fill();
        }
    },
    
    drawGround() {
        // Very dark ground - starts where trees end
        const groundY = DOM.canvas.height * 0.55;
        
        // Super moon glow on ground - much brighter
        const moonX = DOM.canvas.width * 0.78;
        
        const moonGlow = DOM.ctx.createRadialGradient(
            moonX, DOM.canvas.height * 0.3, 0,
            moonX, DOM.canvas.height * 0.3, DOM.canvas.width * 1.5
        );
        moonGlow.addColorStop(0, 'rgba(80, 80, 100, 0.6)');
        moonGlow.addColorStop(0.25, 'rgba(60, 60, 80, 0.45)');
        moonGlow.addColorStop(0.5, 'rgba(45, 45, 65, 0.3)');
        moonGlow.addColorStop(0.75, 'rgba(30, 30, 50, 0.15)');
        moonGlow.addColorStop(1, 'rgba(20, 20, 40, 0.05)');
        
        DOM.ctx.fillStyle = moonGlow;
        DOM.ctx.fillRect(0, groundY, DOM.canvas.width, DOM.canvas.height - groundY);
        
        // Base ground gradient
        const groundGrad = DOM.ctx.createLinearGradient(0, groundY, 0, DOM.canvas.height);
        groundGrad.addColorStop(0, '#181825');
        groundGrad.addColorStop(0.3, '#101018');
        groundGrad.addColorStop(1, '#0A0A10');
        
        DOM.ctx.fillStyle = groundGrad;
        DOM.ctx.fillRect(0, groundY, DOM.canvas.width, DOM.canvas.height - groundY);
        
        // Subtle ground variation
        DOM.ctx.fillStyle = '#151520';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, groundY);
        
        for (let x = 0; x <= DOM.canvas.width; x += 40) {
            const y = groundY + Math.sin(x * 0.01) * 5;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, groundY);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    }
};
