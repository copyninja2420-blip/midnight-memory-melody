import { useState } from "react";
import { Button } from "@/components/ui/button";
import { playCelebration } from "@/lib/storySounds";

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
      <div className="gift-vault-grid mt-8">
        {gifts.map((g, i) => {
          const isOpen = open.includes(i);
          return (
            <Button variant="ghost" key={g.label} type="button" aria-expanded={isOpen} aria-label={isOpen ? g.promise : `Open ${g.label}`} onClick={() => { if (!isOpen) { playCelebration(); setOpen((o) => [...o, i]); } }} className={`gift-box ${isOpen ? "is-open" : ""}`}>
              <span className="gift-lid" aria-hidden="true"><i /><i /><b>❦</b></span>
              <span className="gift-promise">
                {isOpen ? g.promise : g.label}
              </span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
