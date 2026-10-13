import pageSound from '@/assets/parchment-page-turn.mp3.asset.json';

let context: AudioContext | undefined;
let bytes: Promise<ArrayBuffer> | undefined;
let buffer: AudioBuffer | undefined;
let decoding: Promise<AudioBuffer> | undefined;
export function preloadStorySounds() {
  bytes ??= fetch(pageSound.url).then(r => { if (!r.ok) throw new Error('Sound unavailable'); return r.arrayBuffer(); });
  void bytes.catch(() => { bytes = undefined; });
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