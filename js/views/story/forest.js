// =========================================================================
// Forest view - Simple woodland scene for calming/interactive gameplay
// =========================================================================

import { AppState, DOM } from '../../state.js';
import { CONFIG } from '../../config.js';

export const Forest = {
    init() {
        this.drawForest();
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
        this.drawForest();
    },
    
    drawForest() {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        this.drawSky();
        this.drawGround();
        this.drawGrass();
        this.drawFarTrees();
        this.drawSideTrees();
    },
    
    drawSky() {
        // Soft, muted sky gradient - calming colors
        const gradient = DOM.ctx.createLinearGradient(0, 0, 0, DOM.canvas.height * 0.5);
        gradient.addColorStop(0, '#7BA3B8');     // Soft blue-gray
        gradient.addColorStop(0.4, '#8FB5C4');  // Muted teal
        gradient.addColorStop(0.7, '#A8C4CE');  // Soft gray-blue
        gradient.addColorStop(1, '#B8CDD4');    // Very light gray
        
        DOM.ctx.fillStyle = gradient;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Subtle warm glow
        const glow = DOM.ctx.createRadialGradient(
            DOM.canvas.width * 0.5, DOM.canvas.height, 0,
            DOM.canvas.width * 0.5, DOM.canvas.height, DOM.canvas.width * 0.6
        );
        glow.addColorStop(0, 'rgba(180, 160, 140, 0.08)');
        glow.addColorStop(0.5, 'rgba(170, 150, 130, 0.04)');
        glow.addColorStop(1, 'rgba(160, 140, 120, 0)');
        
        DOM.ctx.fillStyle = glow;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    },
    
    drawGround() {
        // Soft muted ground - calming brown-green
        const groundY = DOM.canvas.height * 0.55;
        
        const groundGrad = DOM.ctx.createLinearGradient(0, groundY, 0, DOM.canvas.height);
        groundGrad.addColorStop(0, '#6B7D5E');    // Muted olive
        groundGrad.addColorStop(0.3, '#5D7050');   // Deeper green-brown
        groundGrad.addColorStop(0.7, '#4D5A42');   // Darker
        groundGrad.addColorStop(1, '#3D4A35');     // Dark green-brown
        
        DOM.ctx.fillStyle = groundGrad;
        DOM.ctx.fillRect(0, groundY, DOM.canvas.width, DOM.canvas.height - groundY);
        
        // Subtle ground line
        DOM.ctx.fillStyle = '#5D7050';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, groundY);
        
        for (let x = 0; x <= DOM.canvas.width; x += 40) {
            const y = groundY + Math.sin(x * 0.01) * 5;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, groundY);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },
    
    drawGrass() {
        // Simple grass tufts in the middle - sitting on ground
        const grassY = DOM.canvas.height * 0.57;
        
        const grassCount = 60;
        
        for (let i = 0; i < grassCount; i++) {
            const x = DOM.canvas.width * 0.25 + (i / grassCount) * DOM.canvas.width * 0.5;
            const y = grassY + Math.random() * 30;
            const height = 8 + Math.random() * 15;
            
            // Varying muted greens
            const hue = 85 + Math.random() * 20;
            const sat = 15 + Math.random() * 15;
            const light = 30 + Math.random() * 15;
            
            DOM.ctx.strokeStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
            DOM.ctx.lineWidth = 1.5;
            
            // Simple grass blade
            DOM.ctx.beginPath();
            DOM.ctx.moveTo(x, y);
            DOM.ctx.quadraticCurveTo(
                x + (Math.random() - 0.5) * 6,
                y - height * 0.5,
                x + (Math.random() - 0.5) * 3,
                y - height
            );
            DOM.ctx.stroke();
        }
    },
    
    drawFarTrees() {
        // Forest line at back - dense tree coverage like night scene
        const horizonY = DOM.canvas.height * 0.55;
        
        // Main row of trees - dense coverage
        for (let i = 0; i < 50; i++) {
            const x = (i / 50) * DOM.canvas.width * 1.1 - DOM.canvas.width * 0.05;
            const height = 40 + Math.random() * 40;
            const width = 25 + Math.random() * 20;
            
            this.drawTreeSilhouette(x, horizonY, width, height);
        }
        
        // Fill gaps
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * DOM.canvas.width;
            const height = 30 + Math.random() * 30;
            const width = 18 + Math.random() * 15;
            
            this.drawTreeSilhouette(x, horizonY + Math.random() * 20, width, height);
        }
        
        // Closer trees - slightly larger, in front of main row
        for (let i = 0; i < 30; i++) {
            const x = (i / 30) * DOM.canvas.width * 1.08 - DOM.canvas.width * 0.04;
            const height = 60 + Math.random() * 40;
            const width = 35 + Math.random() * 25;
            
            this.drawTreeSilhouette(x, horizonY + 5, width, height);
        }
    },
    
    drawTreeSilhouette(x, baseY, width, height) {
        // Simple triangular pine silhouette (like night scene)
        const layers = 4;
        
        for (let i = 0; i < layers; i++) {
            const layerY = baseY - (i * height * 0.22);
            const layerWidth = width * (1 - i * 0.22);
            const layerHeight = height * 0.35;
            
            DOM.ctx.fillStyle = '#1A2515';
            
            DOM.ctx.beginPath();
            DOM.ctx.moveTo(x, layerY - layerHeight);
            DOM.ctx.lineTo(x - layerWidth / 2, layerY);
            DOM.ctx.lineTo(x + layerWidth / 2, layerY);
            DOM.ctx.closePath();
            DOM.ctx.fill();
        }
    },
    
    drawSideTrees() {
        // Left side trees - progressing from back to front
        const leftCount = 10;
        for (let i = 0; i < leftCount; i++) {
            const progress = i / (leftCount - 1);
            const x = DOM.canvas.width * 0.02 + Math.random() * DOM.canvas.width * 0.15;
            const y = DOM.canvas.height * (0.55 + progress * 0.15);
            const scale = 0.5 + progress * 0.5;
            this.drawSideTree(x, y, scale);
        }
        
        // Right side trees - progressing from back to front
        const rightCount = 10;
        for (let i = 0; i < rightCount; i++) {
            const progress = i / (rightCount - 1);
            const x = DOM.canvas.width * 0.83 + Math.random() * DOM.canvas.width * 0.15;
            const y = DOM.canvas.height * (0.55 + progress * 0.15);
            const scale = 0.5 + progress * 0.5;
            this.drawSideTree(x, y, scale);
        }
    },
    
    drawSimpleTree(x, baseY, scale) {
        const width = 60 * scale;
        const height = 100 * scale;
        
        // Trunk - connects to ground
        const trunkWidth = width * 0.12;
        const trunkHeight = height * 0.25;
        
        DOM.ctx.fillStyle = '#4A3D2E';
        DOM.ctx.fillRect(x - trunkWidth / 2, baseY - trunkHeight, trunkWidth, trunkHeight);
        
        // Canopy - starts at top of trunk
        const canopyBaseY = baseY - trunkHeight;
        const layers = 4;
        
        for (let i = 0; i < layers; i++) {
            const layerY = canopyBaseY - (i * height * 0.18);
            const layerWidth = width * (1 - i * 0.2);
            const layerHeight = height * 0.3;
            
            // Varying muted greens
            const lightness = 28 + i * 3;
            DOM.ctx.fillStyle = `hsl(100, 20%, ${lightness}%)`;
            
            // Draw triangle with slightly rounded top
            DOM.ctx.beginPath();
            DOM.ctx.moveTo(x, layerY - layerHeight);
            DOM.ctx.lineTo(x - layerWidth / 2, layerY);
            DOM.ctx.lineTo(x + layerWidth / 2, layerY);
            DOM.ctx.closePath();
            DOM.ctx.fill();
        }
    },
    
    drawSideTree(x, baseY, scale) {
        // Tree size based on scale parameter for depth
        const width = 80 * scale;
        const height = 180 * scale;
        
        // Trunk - extends up into canopy (overlaps)
        const trunkWidth = width * 0.12;
        const trunkHeight = height * 0.35;
        
        DOM.ctx.fillStyle = '#4A3D2E';
        // Trunk goes from ground up past where canopy starts
        DOM.ctx.fillRect(x - trunkWidth / 2, baseY - trunkHeight, trunkWidth, trunkHeight);
        
        // Canopy starts inside the trunk (overlaps)
        const canopyBaseY = baseY - trunkHeight * 0.8;
        const layers = 5;
        
        for (let i = 0; i < layers; i++) {
            const layerY = canopyBaseY - (i * height * 0.14);
            const layerWidth = width * (1 - i * 0.18);
            const layerHeight = height * 0.25;
            
            // Varying muted greens - darker at bottom, lighter at top
            const lightness = 22 + i * 2;
            DOM.ctx.fillStyle = `hsl(95, 18%, ${lightness}%)`;
            
            // Triangle shape
            DOM.ctx.beginPath();
            DOM.ctx.moveTo(x, layerY - layerHeight);
            DOM.ctx.lineTo(x - layerWidth / 2, layerY);
            DOM.ctx.lineTo(x + layerWidth / 2, layerY);
            DOM.ctx.closePath();
            DOM.ctx.fill();
        }
    }
};
