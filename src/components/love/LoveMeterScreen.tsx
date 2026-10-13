import { useEffect, useRef, useState } from "react";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { journal } from "@/content/loveStory";

const DURATION = 3200;

function beat(rate: number) {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.16].forEach((at) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 58 + rate * 20;
      gain.gain.setValueAtTime(0.25, ctx.currentTime + at);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + at);
      osc.stop(ctx.currentTime + at + 0.14);
    });
    setTimeout(() => void ctx.close(), 500);
  } catch { /* optional */ }
}

export function LoveMeterScreen({ onContinue }: { onContinue: () => void }) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const frame = useRef<number | null>(null);
  const lastBeat = useRef(0);

  useEffect(() => () => { if (frame.current) cancelAnimationFrame(frame.current); }, []);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onContinue, 3200);
    return () => clearTimeout(t);
  }, [done, onContinue]);

  const start = () => {
    if (done || frame.current !== null) return;
    setHolding(true);
    const began = performance.now() - (progress / 100) * DURATION;
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - began) / DURATION) * 100);
      setProgress(pct);
      const interval = 700 - pct * 4.6;
      if (now - lastBeat.current > interval) {
        lastBeat.current = now;
        beat(pct / 100);
        navigator.vibrate?.(30);
      }
      if (pct >= 100) { frame.current = null; setHolding(false); setDone(true); navigator.vibrate?.([100, 80, 160]); return; }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (done) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = null;
    setHolding(false);
    setProgress(0);
  };

  const pct = Math.round(progress);
  const status = done ? "100% Synced" : holding ? `Synchronizing Soulwaves... ${pct}%` : "Press & Hold To Scan";
  const speed = `${Math.max(0.35, 1.2 - progress / 100)}s`;

  return (
    <section className="love-scanner journey-screen" aria-labelledby="scanner-title" style={{ "--beat-speed": speed, "--scan-glow": progress / 100 } as React.CSSProperties}>
      <header className="relative z-10 text-center">
        <p className="font-display text-xs uppercase text-gold-soft/75">{journal.scanner.eyebrow}</p>
        <h1 id="scanner-title" className="romantic mt-3 text-5xl text-gold-soft">{journal.scanner.title}</h1>
        <p className="script mt-3 text-2xl text-warm/80">{journal.scanner.instruction}</p>
      </header>

      <div className="scanner-heart-stage" aria-hidden="true">
        <span className="scanner-ring" /><span className="scanner-ring scanner-ring-2" />
        <div className={`scanner-crystal ${holding ? "scanner-active" : ""}`}>♥</div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <p className="font-display text-sm tracking-widest text-gold-soft" aria-live="polite">{status}</p>
        {done ? (
          <p className="romantic max-w-xs text-3xl text-gold-soft animate-fade-in">{journal.scanner.result}</p>
        ) : (
          <Button variant="ghost"
            type="button"
            aria-label="Press and hold to scan"
            className={`scanner-pad ${holding ? "scanner-pad-active" : ""}`}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); start(); }}
            onPointerUp={stop}
            onPointerCancel={stop}
            onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); start(); } }}
            onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); stop(); } }}
            onBlur={stop}
            onContextMenu={(e) => e.preventDefault()}
          >
            {holding && <><i className="scanner-ripple" /><i className="scanner-ripple scanner-ripple-2" /><i className="scanner-ripple scanner-ripple-3" /></>}
            <svg className="scanner-progress" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" pathLength="100" style={{ strokeDashoffset: 100 - progress }} /></svg>
            <Fingerprint className="size-12" />
          </Button>
        )}
      </div>
      {done && <div className="scanner-burst" aria-hidden="true">{Array.from({ length: 30 }, (_, i) => <i key={i} style={{ "--burst-angle": `${i * 12}deg`, "--burst-distance": `${120 + (i % 5) * 40}px` } as React.CSSProperties}>✦</i>)}</div>}
    </section>
  );
}
