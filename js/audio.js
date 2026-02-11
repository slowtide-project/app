import { AppState, AudioState, DOM } from './state.js';
import { SOUND_TYPES, CONFIG } from './config.js';

/** Audio system management */
export const AudioEngine = {
    /**
     * Initialize Web Audio API context and nodes
     */
    init() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioState.context) AudioState.context = new AudioContext();
        if (AudioState.context.state === 'suspended') AudioState.context.resume();
        if (!AudioState.gainNode) { 
            AudioState.gainNode = AudioState.context.createGain(); 
            AudioState.gainNode.connect(AudioState.context.destination); 
        }
        this.generateSoundBuffer(AppState.currentSound);
    },

    /**
     * Generate background soundscape buffer
     * @param {string} type - Sound type from SOUND_TYPES
     */
    generateSoundBuffer(type) {
        if (AudioState.noiseSource) { try { AudioState.noiseSource.stop(); } catch (e) { } }
        if (AudioState.waveLFO) { try { AudioState.waveLFO.stop(); } catch (e) { } }
        if (type === SOUND_TYPES.OFF) { 
            AudioState.gainNode.gain.value = 0; 
            return; 
        } else { 
            AudioState.gainNode.gain.value = CONFIG.ATMOSPHERE_VOLUME; 
        }

        const bufferSize = AudioState.context.sampleRate * 2;
        const buffer = AudioState.context.createBuffer(1, bufferSize, AudioState.context.sampleRate);
        const data = buffer.getChannelData(0);

        if (type === SOUND_TYPES.DEEP || type === SOUND_TYPES.WAVES) {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                lastOut = (lastOut + (0.02 * white)) / 1.02;
                data[i] = lastOut * 3.5;
            }
        } else if (type === SOUND_TYPES.RAIN) {
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }
        } else if (type === SOUND_TYPES.STATIC) {
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.5;
            }
        }

        AudioState.noiseSource = AudioState.context.createBufferSource();
        AudioState.noiseSource.buffer = buffer;
        AudioState.noiseSource.loop = true;
        AudioState.noiseSource.connect(AudioState.gainNode);
        AudioState.noiseSource.start(0);

        if (type === SOUND_TYPES.WAVES) {
            AudioState.noiseSource.disconnect();
            const waveNode = AudioState.context.createGain();
            waveNode.gain.value = 0.5;
            AudioState.noiseSource.connect(waveNode);
            waveNode.connect(AudioState.gainNode);
            AudioState.waveLFO = AudioState.context.createOscillator();
            AudioState.waveLFO.type = 'sine';
            AudioState.waveLFO.frequency.value = 0.1;
            AudioState.waveLFO.connect(waveNode.gain);
            AudioState.waveLFO.start();
        }
    }
};

/** Continuous synthesizer for interactive audio */
export const ContinuousSynth = {
    /**
     * Start continuous tone based on interaction
     * @param {string} type - View type for sound character
     * @param {number} yRatio - Y position ratio (0-1) for pitch
     */
    start(type, yRatio) {
        if (!AppState.sfxEnabled || !AudioState.context) return;
        this.stop();

        AudioState.activeSynth = AudioState.context.createOscillator();
        AudioState.activeSynthGain = AudioState.context.createGain();
        AudioState.activeSynth.connect(AudioState.activeSynthGain);
        AudioState.activeSynthGain.connect(AudioState.context.destination);

        const t = AudioState.context.currentTime;
        const freq = CONFIG.SYNTH_FREQUENCY_RANGE.MIN + 
            (1 - yRatio) * (CONFIG.SYNTH_FREQUENCY_RANGE.MAX - CONFIG.SYNTH_FREQUENCY_RANGE.MIN);

        if (type === 'particles') {
            AudioState.activeSynth.type = 'sine';
            AudioState.activeSynth.frequency.value = freq;
            AudioState.activeSynthGain.gain.setValueAtTime(0, t);
            AudioState.activeSynthGain.gain.linearRampToValueAtTime(0.15, t + 0.1);
        } else if (type === 'liquid') {
            AudioState.activeSynth.type = 'triangle';
            AudioState.activeSynth.frequency.value = freq * 0.5;
            AudioState.activeSynthGain.gain.setValueAtTime(0, t);
            AudioState.activeSynthGain.gain.linearRampToValueAtTime(0.1, t + 0.2);
        } else if (type === 'sorting') {
            AudioState.activeSynth.type = 'sawtooth';
            AudioState.activeSynth.frequency.value = 60;
            AudioState.activeSynthGain.gain.setValueAtTime(0, t);
            AudioState.activeSynthGain.gain.linearRampToValueAtTime(0.05, t + 0.1);
        }

        AudioState.activeSynth.start(t);
    },

    /**
     * Update pitch based on continued interaction
     * @param {number} yRatio - Y position ratio (0-1)
     */
    update(yRatio) {
        if (!AudioState.activeSynth) return;
        const t = AudioState.context.currentTime;
        const freq = CONFIG.SYNTH_FREQUENCY_RANGE.MIN + 
            (1 - yRatio) * (CONFIG.SYNTH_FREQUENCY_RANGE.MAX - CONFIG.SYNTH_FREQUENCY_RANGE.MIN);

        if (AudioState.activeSynth.type === 'sine' || AudioState.activeSynth.type === 'triangle') {
            AudioState.activeSynth.frequency.setTargetAtTime(freq, t, 0.1);
        }
    },

    /**
     * Stop continuous tone with fade out
     */
    stop() {
        if (!AudioState.activeSynth) return;
        const t = AudioState.context.currentTime;
        AudioState.activeSynthGain.gain.cancelScheduledValues(t);
        AudioState.activeSynthGain.gain.setTargetAtTime(0, t, 0.1);
        AudioState.activeSynth.stop(t + 0.15);
        AudioState.activeSynth = null;
        AudioState.activeSynthGain = null;
    }
};

/** Discrete sound effects */
export const SFX = {
    /**
     * Play a sound effect
     * @param {string} type - 'pop' or 'clack'
     */
    play(type) {
        if (!AudioState.context || !AppState.sfxEnabled) return;
        if (AudioState.context.state === 'suspended') AudioState.context.resume();
        if (type === 'clack' && Date.now() - AppState.lastSFX < CONFIG.SFX_DEBOUNCE_TIME) return;
        AppState.lastSFX = Date.now();

        const osc = AudioState.context.createOscillator();
        const gain = AudioState.context.createGain();
        osc.connect(gain);
        gain.connect(AudioState.context.destination);
        const t = AudioState.context.currentTime;

        if (type === 'pop') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
            osc.start(t); osc.stop(t + 0.15);
        } else if (type === 'clack') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300 + Math.random() * 100, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            osc.start(t); osc.stop(t + 0.1);
        }
    }
};

/** Audio system kickstart for mobile browsers */
document.body.addEventListener('touchstart', function () {
    if (AudioState.context && AudioState.context.state === 'suspended') AudioState.context.resume();
}, { once: true });