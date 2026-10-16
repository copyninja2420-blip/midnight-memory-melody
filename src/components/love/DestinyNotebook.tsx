import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { calculateRomanticDestiny, type FlamesLetter } from "@/lib/flames";
import type { DestinyNames } from "./DestinyEntry";
import paper from "@/assets/destiny-paper.jpg";

const LETTERS: FlamesLetter[] = ["F", "L", "A", "M", "E", "S"];

export function DestinyNotebook({ names, onReveal }: { names: DestinyNames; onReveal: () => void }) {
  const result = useMemo(() => calculateRomanticDestiny(names.yourName, names.partnerName), [names]);
  const [struck, setStruck] = useState(0);
  const [gone, setGone] = useState(0);
  const [counting, setCounting] = useState(false);
  const [done, setDone] = useState(false);
  const [active, setActive] = useState<FlamesLetter | null>(null);
  const [written, setWritten] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const schedule = (fn: () => void, time: number) => timers.push(setTimeout(fn, reduced ? 0 : time));
    let time = 350;
    const length = result.a.length + result.b.length;
    for (let i = 0; i < length; i++) {
      schedule(() => setWritten(i + 1), time);
      time += 85;
    }
    time += 450;
    result.strikes.forEach((_, index) => {
      schedule(() => setStruck(index + 1), time);
      time += 440;
    });
    time += 650;
    schedule(() => setCounting(true), time);
    let live = [...LETTERS];
    let cursor = 0;
    result.eliminated.forEach((letter, index) => {
      // Show a lap of the surviving letters, ending on the next crossed-out letter.
      const target = live.indexOf(letter);
      const steps = ((target - cursor + live.length) % live.length) + 1;
      for (let n = 0; n < steps; n++) {
        const current = live[(cursor + n) % live.length];
        schedule(() => setActive(current ?? null), time);
        time += 220;
      }
      schedule(() => { setGone(index + 1); setActive(null); }, time + 220);
      time += 680;
      live = live.filter((item) => item !== letter);
      cursor = target % live.length;
    });
    schedule(() => { setActive("M"); setDone(true); }, time + 450);
    return () => timers.forEach(clearTimeout);
  }, [result]);

  const isStruck = (side: 0 | 1, index: number) => result.strikes.slice(0, struck).some((pair) => pair[side] === index);

  return (
    <section className="destiny-notebook journey-screen" aria-labelledby="notebook-title">
      <img src={paper} alt="" aria-hidden="true" className="notebook-texture" width={1024} height={1536} />
      <div className="notebook-content relative z-10 mx-auto w-full max-w-2xl text-center">
        <p className="notebook-eyebrow">a little page from our forever</p>
        <h1 id="notebook-title" className="mb-10 text-4xl sm:text-5xl">F • L • A • M • E • S</h1>
        <div className="space-y-3">
          {[result.a, result.b].map((letters, side) => (
            <div key={side} className="notebook-name" aria-label={side === 0 ? names.yourName : names.partnerName}>
              {letters.map((letter, index) => {
                const visible = written > index + (side === 1 ? result.a.length : 0);
                const crossed = isStruck(side as 0 | 1, index);
                const lastStrike = result.strikes[struck - 1];
                return <span key={index} className={`pencil-letter handwriting-letter ${visible ? "letter-written" : ""} ${crossed ? "pencil-crossed" : ""}`}>{index === 0 ? letter.toUpperCase() : letter.toLowerCase()}<i aria-hidden="true" />{lastStrike?.[side] === index && <span className="graphite-pencil" aria-hidden="true"><b /></span>}</span>;
              })}
            </div>
          ))}
        </div>
        <div className="notebook-calculation" aria-live="polite">
          <p className={counting ? "opacity-100" : "opacity-0"}>{result.remaining} letters, a thousand possibilities…</p>
          <div className={`notebook-flames ${counting ? "opacity-100" : "opacity-0"}`}>
            {LETTERS.map((letter) => <span key={letter} className={`pencil-letter ${result.eliminated.slice(0, gone).includes(letter) ? "pencil-crossed" : ""} ${active === letter ? "pencil-active" : ""} ${done && letter === "M" ? "pencil-winner" : ""}`}>
              {letter}<i aria-hidden="true" />
              {done && letter === "M" && <svg className="destiny-circle" viewBox="0 0 100 110" aria-hidden="true"><path d="M50 20 C20 -3 0 22 12 49 C22 71 41 89 50 99 C65 84 96 60 93 33 C91 7 64 3 50 20" pathLength="1" /></svg>}
            </span>)}
          </div>
        </div>
        <div className="notebook-result" aria-live="polite">
          {done && <div className="animate-fade-in"><h2 className="text-4xl sm:text-5xl">Marriage — Written in the Stars 💍</h2><p className="mt-5 text-2xl">Every letter led me back to you.</p><Button onClick={onReveal} className="journey-gold-button mt-8 w-full sm:w-auto">Reveal Our Final Surprise ❤️</Button></div>}
        </div>
      </div>
    </section>
  );
}