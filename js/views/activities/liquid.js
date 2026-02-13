import { AppState, DOM } from '../../state.js';
import { CONFIG } from '../../config.js';

export const Liquid = {
    orbitPhase: 0,
    
    spawn(x, y) { 
        for (let r = 5; r <= 30; r += 5) {
            setTimeout(() => {
                DOM.ctx.beginPath(); 
                DOM.ctx.arc(x, y, r, 0, Math.PI * 2); 
                DOM.ctx.strokeStyle = `hsla(${(Date.now() + r * 10) % 360},70%,60%,${1 - r/30})`; 
                DOM.ctx.lineWidth = 2;
                DOM.ctx.stroke();
            }, (r - 5) * 30);
        }
    },

    handleStart(x, y) {
        this.spawn(x, y);
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                let offsetX = (Math.random() - 0.5) * 100;
                let offsetY = (Math.random() - 0.5) * 100;
                this.spawn(x + offsetX, y + offsetY);
            }, i * 100);
        }
    },

    checkSpontaneousRipples() {
        if (Math.random() >= CONFIG.EMERGENT_EVENT_CHANCE_COMMON) return;
        
        let x = Math.random() * DOM.canvas.width;
        let y = Math.random() * DOM.canvas.height;
        this.createRipple(x, y);
    },

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

    update() {
        DOM.ctx.fillStyle = `rgba(5,5,5,${CONFIG.LIQUID_FADE_ALPHA})`; 
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        this.checkSpontaneousRipples();
        
        const orbitSpeed = 0.01;
        const orbitCount = 3;
        
        this.orbitPhase += orbitSpeed;
        
        for (let i = 0; i < orbitCount; i++) {
            let offsetPhase = this.orbitPhase + (i * Math.PI * 2 / orbitCount);
            let radiusX = (DOM.canvas.width / 3) * (1 + i * 0.1);
            let radiusY = (DOM.canvas.height / 4) * (1 + i * 0.1);
            let dropX = DOM.canvas.width / 2 + Math.sin(offsetPhase) * radiusX;
            let dropY = DOM.canvas.height / 2 + Math.cos(offsetPhase * 1.3) * radiusY;
            let dropSize = 25 - i * 5;
            
            DOM.ctx.beginPath(); 
            DOM.ctx.arc(dropX, dropY, dropSize, 0, Math.PI * 2); 
            DOM.ctx.fillStyle = `hsl(${(Date.now() + i * 100) % 360},70%,60%)`; 
            DOM.ctx.shadowBlur = 30; 
            DOM.ctx.shadowColor = DOM.ctx.fillStyle;
            DOM.ctx.fill(); 
            DOM.ctx.shadowBlur = 0;
        }
    }
};
