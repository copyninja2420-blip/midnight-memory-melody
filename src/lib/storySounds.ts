import pageSound from '@/assets/parchment-page-turn.mp3.asset.json';

let context: AudioContext | undefined;
let bytes: Promise<ArrayBuffer> | undefined;
let buffer: AudioBuffer | undefined;
let decoding: Promise<AudioBuffer> | undefined;
let unlockBound = false;
export function preloadStorySounds() {
  bytes ??= fetch(pageSound.url).then(r => { if (!r.ok) throw new Error('Sound unavailable'); return r.arrayBuffer(); });
  void bytes.catch(() => { bytes = undefined; });
  // Decode during boot even if the audio context is still suspended.
  if (typeof window !== 'undefined') {
    try {
      context ??= new AudioContext();
      decoding ??= bytes.then(data => context?.decodeAudioData(data.slice(0))).then(sound => {
        if (!sound) throw new Error('Sound unavailable');
        buffer = sound;
        return sound;
      });
      void decoding.catch(() => { decoding = undefined; });
    } catch { /* Audio remains optional. */ }
  }
  if (typeof window !== 'undefined' && !unlockBound) {
    unlockBound = true;
    // Decode on the first tap so every later turn plays instantly from memory.
    const unlock = () => {
      try {
        const ctx = audioContext();
        if (!buffer && bytes) {
          decoding ??= bytes.then(data => ctx.decodeAudioData(data.slice(0)));
          void decoding.then(sound => { buffer = sound; }).catch(() => { decoding = undefined; });
        }
      } catch { /* optional */ }
    };
    window.addEventListener('pointerdown', unlock, { once: true, capture: true });
    window.addEventListener('keydown', unlock, { once: true, capture: true });
  }
}
function audioContext() {
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}
export function playPageTurn() {
  try {
    const ctx = audioContext();
    preloadStorySounds();
    const play = (sound: AudioBuffer) => {
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = sound;
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(.65, now + .04);
      gain.gain.setValueAtTime(.65, now + 1);
      gain.gain.linearRampToValueAtTime(0, now + 1.3);
      source.connect(gain).connect(ctx.destination);
      source.onended = () => { source.disconnect(); gain.disconnect(); };
      source.start(now, .15, 1.3);
    };
    if (buffer) play(buffer);
    else if (bytes) {
      decoding ??= bytes.then(data => ctx.decodeAudioData(data.slice(0)));
      void decoding.then(sound => { buffer = sound; play(sound); }).catch(() => { decoding = undefined; });
    }
  } catch { /* Optional effects never block a page turn. */ }
}
export function playCelebration() {
  try {
    const ctx = audioContext();
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      const at = ctx.currentTime + i * .11;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.075, at + .02); gain.gain.exponentialRampToValueAtTime(.001, at + .65);
      osc.connect(gain).connect(ctx.destination); osc.start(at); osc.stop(at + .7);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  } catch { /* Optional. */ }
}

export function playHeartbeat(rate: number) {
  try {
    const ctx = audioContext();
    [0, .16].forEach(offset => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const at = ctx.currentTime + offset;
      oscillator.frequency.value = 58 + rate * 20;
      gain.gain.setValueAtTime(.2, at);
      gain.gain.exponentialRampToValueAtTime(.001, at + .12);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(at);
      oscillator.stop(at + .14);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  } catch { /* Optional effect. */ }
}