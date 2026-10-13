import { useEffect, useRef, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { journal } from "@/content/loveStory";
import { startMusicFromGesture } from "@/lib/musicUnlock";

export default function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const unlock = (code: string) => {
    if (unlocked) return;
    if (code === journal.passcode) {
      setUnlocked(true);
      startMusicFromGesture();
      playLatch();
      onUnlock();
    } else {
      setError(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setDigits(["", "", "", ""]);
        setError(false);
        inputs.current[0]?.focus();
      }, 1200);
    }
  };
  const change = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "").slice(0, 4);
    const next = value.length > 1 ? ["", "", "", ""].map((_, i) => value[i] ?? "") : digits.map((d, i) => i === index ? value : d);
    setDigits(next);
    setError(false);
    if (next.every(Boolean)) unlock(next.join(""));
    else inputs.current[value.length > 1 ? Math.min(value.length, 3) : Math.min(index + 1, 3)]?.focus();
  };
  return (
    <section className={`journal-cover journey-screen ${error ? "cover-error" : ""}`} aria-labelledby="cover-title">
      <div className="cover-spine" aria-hidden="true" />
      <div className="cover-content">
        <p className="cover-edition">A PRIVATE DIARY · VOLUME I</p>
        <div className="cover-flourish" aria-hidden="true">❧</div>
        <h1 id="cover-title" className="romantic text-6xl leading-tight text-gold-soft sm:text-7xl">{journal.title}</h1>
        <p className="script mt-5 text-2xl text-warm/75">Every page, a little closer to forever.</p>
        <div className="cover-medallion" aria-hidden="true"><span className="romantic">{journal.crest}</span><span className="medallion-leaves">❦</span></div>
        <form onSubmit={(e) => { e.preventDefault(); unlock(digits.join("")); }}>
          <label className="mb-5 block font-display text-sm text-gold-soft/80">The key to our story</label>
          <div className="passcode-boxes">
            {digits.map((digit, i) => <input key={i} ref={(el) => { inputs.current[i] = el; }} aria-label={`Passcode digit ${i + 1}`} type="text" inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={4} value={digit} disabled={unlocked} onChange={(e) => change(i, e.target.value)} onFocus={(e) => e.currentTarget.select()} onKeyDown={(e) => { if (e.key === "Backspace" && !digit && i > 0) inputs.current[i - 1]?.focus(); }} className="passcode-input" />)}
          </div>
          <p role="alert" className="mt-4 min-h-6 text-sm text-rose-glow">{error ? "Not quite — try again, my love." : ""}</p>
          <Button type="submit" disabled={unlocked} variant="ghost" className="cover-unlock mt-2 text-gold-soft"><LockKeyhole className="size-4" />{unlocked ? "Our story is opening…" : "Open our story"}</Button>
        </form>
        <p className="cover-footer">FOR YOUR EYES, AND YOUR HEART, ONLY</p>
      </div>
    </section>
  );
}

function playLatch() {
  try {
    const ctx = new AudioContext();
    [0, .09].forEach((at, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(i ? 520 : 880, ctx.currentTime + at);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + at + .08);
      gain.gain.setValueAtTime(.12, ctx.currentTime + at);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + at + .12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + at);
      osc.stop(ctx.currentTime + at + .14);
    });
    setTimeout(() => void ctx.close(), 600);
  } catch { /* Optional sound; music playback is independent. */ }
}