import { useEffect, useState } from "react";
import { proposalMilestone } from "@/content/loveStory";

/** Gold plaque that counts up live from our special date. */
export function LoveTimer() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const total = now === null ? 0 : Math.max(0, Math.floor((now - new Date(proposalMilestone.date).getTime()) / 1000));
  const parts = [
    [Math.floor(total / 86400), "Days"],
    [Math.floor((total % 86400) / 3600), "Hours"],
    [Math.floor((total % 3600) / 60), "Minutes"],
    [total % 60, "Seconds"],
  ] as const;
  return (
    <div className="love-timer-plaque mx-auto mb-14 mt-6 max-w-md px-5 py-6 text-center">
      <p className="script text-2xl text-gold-soft">Loving You For:</p>
      <p className="mt-3 font-display text-lg text-warm" aria-live="off">
        {parts.map(([v, l], i) => (
          <span key={l}>
            <strong className="text-2xl text-gold-soft">{v}</strong> {l}{i < 3 ? ", " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}
