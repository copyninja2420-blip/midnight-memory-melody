import { useEffect, useState } from "react";
import { couple, finale } from "@/content/loveStory";
import { useReveal } from "@/hooks/useReveal";
import { say, setMood, walkTo } from "@/lib/companion";
import { Button } from '@/components/ui/button';

export function Finale() {
  const { ref, shown } = useReveal(0.4);
  const [chosen, setChosen] = useState(false);
  const [forever, setForever] = useState(false);
  const [beat, setBeat] = useState(0);
  useEffect(() => {
    if (!chosen) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers = finale.beats.map((_, i) => setTimeout(() => setBeat(i + 1), reduced ? 0 : 1100 * (i + 1)));
    const mood = setTimeout(() => setMood('present'), 1300);
    return () => { timers.forEach(clearTimeout); clearTimeout(mood); };
  }, [chosen]);
  const complete = chosen && beat >= finale.beats.length;

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-7 pb-24 pt-28 text-center">
      <div className="absolute inset-0 bg-halo" aria-hidden="true" />
      <div ref={ref} className={`finale-content relative w-full max-w-sm reveal ${shown ? "reveal-in" : ""}`}>
        <p className="script text-2xl text-gold-soft">{finale.question}</p>
        <div className="finale-answer-slot mt-8" aria-live="polite">
          {!chosen && <Button onClick={() => { setChosen(true); walkTo(.5, 'walk'); }} className="btn-love finale-reveal-button"><span className="btn-love-glow" /><span className="relative">Reveal my answer ❤️</span></Button>}
          {chosen && <><div className="answer-glow" aria-hidden="true" />{Array.from({ length: 10 }, (_, i) => <span key={i} className="stardust" aria-hidden="true" style={{ left: `${(i * 29) % 100}%`, top: `${(i * 41) % 100}%`, animationDelay: `${i % 7 * .6}s` }} />)}</>}
          <p className={chosen ? 'foil-line font-display text-[1.55rem] leading-snug' : 'invisible font-display text-[1.55rem] leading-snug'}>{finale.answer}</p>
          <div className="relative mt-6 space-y-2">{finale.beats.map((b, i) => <p key={b} className={chosen && beat > i ? 'foil-line font-serif text-lg' : 'invisible font-serif text-lg'}>{b}</p>)}</div>
        </div>
        <div className={`finale-closing-slot ${complete ? 'is-visible' : ''}`} aria-hidden={!complete}>
          <span className="locked-heart text-6xl" aria-hidden="true">❤</span>
          <p className="mt-8 whitespace-pre-line font-display text-xl leading-relaxed text-gradient-love">{finale.closing}</p>
          <Button disabled={!complete} onClick={() => { setForever(true); setMood('present'); say('Forever with you.', 6000); }} className={`btn-love mt-10 h-auto max-w-full whitespace-normal px-9 py-4 leading-snug ${forever ? 'btn-forever' : ''}`}><span className="btn-love-glow" /><span className="relative">{forever ? 'Always, and always ❤️' : finale.button}</span></Button>
          <p className="romantic name-shimmer mt-12 text-3xl">{couple.husbandName}</p>
        </div>
      </div>
    </section>
  );
}
