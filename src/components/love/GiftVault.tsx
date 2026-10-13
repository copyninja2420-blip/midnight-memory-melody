import { useState } from "react";

const gifts = [
  { label: "Gift I", promise: "I promise to hold your hand through every storm and every sunrise. 🤍" },
  { label: "Gift II", promise: "I promise to make you laugh even on the days you don't want to. 😊" },
  { label: "Gift III", promise: "I promise to choose you — today, tomorrow, and every day after. 💍" },
];

/** Three gift boxes that flip open to reveal promises. */
export function GiftVault() {
  const [open, setOpen] = useState<number[]>([]);
  return (
    <section className="mx-auto max-w-lg px-5 py-14 text-center" aria-labelledby="vault-title">
      <h2 id="vault-title" className="romantic text-4xl text-gold-soft">Special Gift Vault</h2>
      <p className="mt-2 font-serif text-sm text-warm/70">Tap each box to unwrap a promise.</p>
      <div className="mt-8 grid grid-cols-3 gap-3" style={{ perspective: 900 }}>
        {gifts.map((g, i) => {
          const isOpen = open.includes(i);
          return (
            <button key={g.label} type="button" aria-label={isOpen ? g.promise : `Open ${g.label}`} onClick={() => setOpen((o) => (o.includes(i) ? o : [...o, i]))} className={`gift-box ${isOpen ? "is-open" : ""}`}>
              <span className="relative z-10 flex h-full items-center justify-center p-2 font-serif text-[0.7rem] leading-snug text-warm sm:text-xs">
                {isOpen ? g.promise : <span className="text-3xl">🎁</span>}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
