import { useEffect, useRef, useState } from "react";
import { journal } from "@/content/loveStory";
import { Button } from "@/components/ui/button";
import { playPageTurn } from "@/lib/storySounds";
import leather from "@/assets/wine-leather.jpg";

/** Closed velvet diary cover — the seal swings the cover open to reveal the passcode page. */
export function ClosedCover({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crestTaps = useRef(0);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (crestTimer.current) clearTimeout(crestTimer.current); }, []);
  const open = () => {
    if (opening) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOpening(true);
    playPageTurn();
    timer.current = setTimeout(onOpen, reduced ? 0 : 1250);
  };
  const tapCrest = () => {
    window.dispatchEvent(new Event('journal-crest-tap'));
    crestTaps.current++;
    if (crestTimer.current) clearTimeout(crestTimer.current);
    if (crestTaps.current >= 3) { crestTaps.current = 0; return; }
    crestTimer.current = setTimeout(() => { crestTaps.current = 0; open(); }, 950);
  };
  return (
    <section className="closed-cover-stage" aria-label="Closed diary cover">
      <div className="book-paper-stack" aria-hidden="true" />
      <div className={`closed-cover ${opening ? "is-opening" : ""}`}>
        <div className="book-leather-spine" aria-hidden="true"><span>OUR LOVE JOURNEY</span></div>
        <div className="closed-cover-face">
          <img src={leather} className="cover-leather-texture" width={1024} height={1024} alt="" aria-hidden="true" fetchPriority="high" />
          {["tl", "tr", "bl", "br"].map((c) => <span key={c} className={`filigree filigree-${c}`} aria-hidden="true">❦</span>)}
          <p className="cover-edition">A PRIVATE DIARY</p>
          <h1 className="romantic closed-cover-title">{journal.title}</h1>
          <Button variant="ghost" type="button" onClick={tapCrest} disabled={opening} className="lock-medallion" aria-label="Tap to open our diary"><span className="romantic">{journal.crest}</span></Button>
          <Button variant="ghost" type="button" onClick={open} disabled={opening} className="cover-open-label"><span className="script">Tap to Open</span></Button>
        </div>
        <div className="closed-cover-back" aria-hidden="true" />
      </div>
    </section>
  );
}
