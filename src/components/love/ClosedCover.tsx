import { useState } from "react";
import { journal } from "@/content/loveStory";

/** Closed velvet diary cover — the seal swings the cover open to reveal the passcode page. */
export function ClosedCover({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  const open = () => {
    if (opening) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOpening(true);
    window.setTimeout(onOpen, reduced ? 0 : 1250);
  };
  return (
    <section className="closed-cover-stage" aria-label="Closed diary cover">
      <div className={`closed-cover ${opening ? "is-opening" : ""}`}>
        <div className="closed-cover-face">
          {["tl", "tr", "bl", "br"].map((c) => <span key={c} className={`filigree filigree-${c}`} aria-hidden="true">❦</span>)}
          <p className="cover-edition">A PRIVATE DIARY</p>
          <h1 className="romantic closed-cover-title">{journal.title}</h1>
          <div className="lock-medallion" aria-hidden="true"><span className="romantic">{journal.crest}</span></div>
          <button type="button" onClick={open} className="wax-seal" aria-label="Tap to open our diary">
            <span className="script">Tap to Open</span>
          </button>
        </div>
        <div className="closed-cover-back" aria-hidden="true" />
      </div>
    </section>
  );
}
