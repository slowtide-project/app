// =========================================================================
// Beach view - Calming beach scene for story mode with walking
// =========================================================================

import { AppState, DOM } from '../../state.js';
import { CONFIG, SCROLL_SETTINGS } from '../../config.js';
import { BaseScene, seededRandom } from './base-scene.js';

export const Beach = {
    ...BaseScene,
    
    waves: [],
    shorelineNoise: [],
    rocks: [],
    pebbles: [],

    generateElements() {
        const horizonY = DOM.canvas.height * 0.55;
        const screenWidth = DOM.canvas.width;
        const worldWidth = screenWidth * 3;

        this.waves = [];
        for (let i = 0; i < 3; i++) {
            const seed = i * 100 + 1;
            this.waves.push({
                baseY: horizonY * 0.75 + seededRandom(seed) * horizonY * 0.1,
                amplitude: 3 + seededRandom(seed + 1) * 3,
                frequency: 0.015 + seededRandom(seed + 2) * 0.01,
                phase: seededRandom(seed + 3) * Math.PI * 2
            });
        }

        this.shorelineNoise = [];
        for (let i = 0; i < 49; i++) {
            const seed = i * 50 + 50;
            this.shorelineNoise.push({
                offset: (seededRandom(seed) - 0.5) * 12
            });
        }
        // Make noise periodic by adding the first value at the end for seamless wrap
        this.shorelineNoise.push({
            offset: this.shorelineNoise[0].offset
        });

        this.rocks = [];
        for (let i = 0; i < 25; i++) {
            const seed = i * 100 + 100;
            this.rocks.push({
                baseX: seededRandom(seed) * worldWidth,
                baseY: horizonY + seededRandom(seed + 1) * (DOM.canvas.height - horizonY),
                size: 5 + seededRandom(seed + 2) * 15,
                shade: 40 + seededRandom(seed + 3) * 20
            });
        }

        this.pebbles = [];
        for (let i = 0; i < 50; i++) {
            const seed = i * 100 + 2000;
            this.pebbles.push({
                baseX: seededRandom(seed) * worldWidth,
                baseY: horizonY + seededRandom(seed + 1) * (DOM.canvas.height - horizonY),
                width: 2 + seededRandom(seed + 2) * 6,
                height: 1.5 + seededRandom(seed + 3) * 4,
                rotation: seededRandom(seed + 4) * Math.PI * 2,
                shade: 50 + seededRandom(seed + 5) * 25,
                hue: 30 + seededRandom(seed + 6) * 20
            });
        }
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

    drawSceneWithOffset(scrollOffset) {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        const p = SCROLL_SETTINGS.PARALLAX_FACTORS;
        
        this.drawSky();
        this.drawOceanWithOffset(scrollOffset * p.GROUND);
        this.drawSceneGroundWithOffset(scrollOffset * p.GROUND);
        this.drawRocksWithOffset(scrollOffset * p.GROUND);
        this.drawPebblesWithOffset(scrollOffset * p.GROUND);
    },

    drawScene() {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        this.drawSky();
        this.drawOcean();
        this.drawSceneGround();
        this.drawRocks();
        this.drawPebbles();
    },

    drawSky() {
        const gradient = DOM.ctx.createLinearGradient(0, 0, 0, DOM.canvas.height * 0.5);
        gradient.addColorStop(0, '#8BA5B5');
        gradient.addColorStop(0.4, '#9FB5C5');
        gradient.addColorStop(0.7, '#B0C5CF');
        gradient.addColorStop(1, '#C5D5DF');
        
        DOM.ctx.fillStyle = gradient;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        const glow = DOM.ctx.createRadialGradient(
            DOM.canvas.width * 0.5, DOM.canvas.height, 0,
            DOM.canvas.width * 0.5, DOM.canvas.height, DOM.canvas.width * 0.6
        );
        glow.addColorStop(0, 'rgba(180, 160, 140, 0.06)');
        glow.addColorStop(0.5, 'rgba(170, 150, 130, 0.03)');
        glow.addColorStop(1, 'rgba(160, 140, 120, 0)');
        
        DOM.ctx.fillStyle = glow;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    },

    drawOcean() {
        const oceanTop = DOM.canvas.height * 0.45;
        
        const oceanGrad = DOM.ctx.createLinearGradient(0, oceanTop, 0, DOM.canvas.height * 0.6);
        oceanGrad.addColorStop(0, '#5D8A9A');
        oceanGrad.addColorStop(0.3, '#4A7A8A');
        oceanGrad.addColorStop(0.7, '#3D6A7A');
        oceanGrad.addColorStop(1, '#305A6A');
        
        DOM.ctx.fillStyle = oceanGrad;
        DOM.ctx.fillRect(0, oceanTop, DOM.canvas.width, DOM.canvas.height * 0.15);
        
        DOM.ctx.fillStyle = '#4D7A8A';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, oceanTop + 15);
        
        for (let x = 0; x <= DOM.canvas.width; x += 20) {
            const y = oceanTop + 15 + Math.sin(x * 0.02) * 3 + Math.sin(x * 0.05) * 2;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, oceanTop);
        DOM.ctx.lineTo(0, oceanTop);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },

    drawOceanWithOffset(offset) {
        const oceanTop = DOM.canvas.height * 0.45;
        const worldWidth = DOM.canvas.width * 3;
        
        const oceanGrad = DOM.ctx.createLinearGradient(0, oceanTop, 0, DOM.canvas.height * 0.6);
        oceanGrad.addColorStop(0, '#5D8A9A');
        oceanGrad.addColorStop(0.3, '#4A7A8A');
        oceanGrad.addColorStop(0.7, '#3D6A7A');
        oceanGrad.addColorStop(1, '#305A6A');
        
        DOM.ctx.fillStyle = oceanGrad;
        DOM.ctx.fillRect(0, oceanTop, DOM.canvas.width, DOM.canvas.height * 0.15);
        
        for (let w = -1; w <= 1; w++) {
            const waveOffset = offset + w * worldWidth;
            
            DOM.ctx.fillStyle = '#4D7A8A';
            DOM.ctx.beginPath();
            DOM.ctx.moveTo(-worldWidth + waveOffset, oceanTop + 15);
            
            for (let x = -worldWidth; x <= worldWidth * 2; x += 20) {
                const worldX = x + waveOffset;
                const y = oceanTop + 15 + Math.sin(worldX * 0.02) * 3 + Math.sin(worldX * 0.05) * 2;
                DOM.ctx.lineTo(worldX, y);
            }
            
            DOM.ctx.lineTo(worldWidth * 2 + waveOffset, oceanTop);
            DOM.ctx.lineTo(-worldWidth + waveOffset, oceanTop);
            DOM.ctx.closePath();
            DOM.ctx.fill();
        }
    },
    
    drawSceneGround() {
        const beachTop = DOM.canvas.height * 0.55;
        
        const sandGrad = DOM.ctx.createLinearGradient(0, beachTop, 0, DOM.canvas.height);
        sandGrad.addColorStop(0, '#C4B59D');
        sandGrad.addColorStop(0.3, '#B5A58D');
        sandGrad.addColorStop(0.7, '#A6957D');
        sandGrad.addColorStop(1, '#978568');
        
        DOM.ctx.fillStyle = sandGrad;
        DOM.ctx.fillRect(0, beachTop, DOM.canvas.width, DOM.canvas.height - beachTop);
        
        DOM.ctx.fillStyle = '#B5A58D';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, beachTop);
        
        for (let x = 0; x <= DOM.canvas.width; x += 20) {
            const y = beachTop + Math.sin(x * 0.015) * 4 + Math.sin(x * 0.03) * 2;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, beachTop);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },

    drawSceneGroundWithOffset(offset) {
        const beachTop = DOM.canvas.height * 0.55;
        const worldWidth = DOM.canvas.width * 3;
        
        const sandGrad = DOM.ctx.createLinearGradient(0, beachTop, 0, DOM.canvas.height);
        sandGrad.addColorStop(0, '#C4B59D');
        sandGrad.addColorStop(0.3, '#B5A58D');
        sandGrad.addColorStop(0.7, '#A6957D');
        sandGrad.addColorStop(1, '#978568');
        
        DOM.ctx.fillStyle = sandGrad;
        DOM.ctx.fillRect(0, beachTop, DOM.canvas.width, DOM.canvas.height - beachTop);
        
        DOM.ctx.fillStyle = '#B5A58D';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, beachTop);
        
        const noiseArr = this.shorelineNoise || [];
        const noiseCount = noiseArr.length;
        
        for (let x = 0; x <= DOM.canvas.width; x += 20) {
            const worldX = x + offset;
            const wrappedWorldX = this.wrapX(worldX, worldWidth);
            
            const sineWave = Math.sin(wrappedWorldX * 0.015) * 4 + Math.sin(wrappedWorldX * 0.03) * 2;
            const y = beachTop + sineWave;
            
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, beachTop);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },

    drawRocks() {
        for (let i = 0; i < this.rocks.length; i++) {
            const rock = this.rocks[i];
            this.drawRock(rock.baseX, rock.baseY, rock.size, rock.shade);
        }
    },

    drawRocksWithOffset(offset) {
        const worldWidth = DOM.canvas.width * 3;
        
        for (let i = 0; i < this.rocks.length; i++) {
            const rock = this.rocks[i];
            const wrappedX = this.wrapX(rock.baseX - offset, worldWidth);
            
            if (wrappedX > -50 && wrappedX < DOM.canvas.width + 50) {
                this.drawRock(wrappedX, rock.baseY, rock.size, rock.shade);
            }
        }
    },

    drawRock(x, y, size, shade) {
        DOM.ctx.fillStyle = `hsl(30, 10%, ${shade}%)`;
        DOM.ctx.beginPath();
        DOM.ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
        DOM.ctx.fill();
        
        DOM.ctx.fillStyle = `hsl(30, 10%, ${shade + 5}%)`;
        DOM.ctx.beginPath();
        DOM.ctx.ellipse(x - size * 0.2, y - size * 0.2, size * 0.5, size * 0.35, 0, 0, Math.PI * 2);
        DOM.ctx.fill();
    },

    drawPebbles() {
        for (let i = 0; i < this.pebbles.length; i++) {
            const pebble = this.pebbles[i];
            this.drawPebble(pebble.baseX, pebble.baseY, pebble.width, pebble.height, pebble.rotation, pebble.shade, pebble.hue);
        }
    },

    drawPebblesWithOffset(offset) {
        const worldWidth = DOM.canvas.width * 3;
        
        for (let i = 0; i < this.pebbles.length; i++) {
            const pebble = this.pebbles[i];
            const wrappedX = this.wrapX(pebble.baseX - offset, worldWidth);
            
            if (wrappedX > -30 && wrappedX < DOM.canvas.width + 30) {
                this.drawPebble(wrappedX, pebble.baseY, pebble.width, pebble.height, pebble.rotation, pebble.shade, pebble.hue);
            }
        }
    },

    drawPebble(x, y, width, height, rotation, shade, hue) {
        DOM.ctx.save();
        DOM.ctx.translate(x, y);
        DOM.ctx.rotate(rotation);
        
        DOM.ctx.fillStyle = `hsl(${hue}, 10%, ${shade}%)`;
        DOM.ctx.beginPath();
        DOM.ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
        DOM.ctx.fill();
        
        DOM.ctx.fillStyle = `hsl(${hue}, 10%, ${shade + 8}%)`;
        DOM.ctx.beginPath();
        DOM.ctx.ellipse(-width * 0.2, -height * 0.2, width * 0.4, height * 0.4, 0, 0, Math.PI * 2);
        DOM.ctx.fill();
        
        DOM.ctx.restore();
    }
};
