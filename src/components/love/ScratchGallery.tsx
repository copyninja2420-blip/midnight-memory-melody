import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { scratchMemories } from '@/content/loveStory';
import { dissolveRevealed } from '@/lib/journalSurprises';
import { playCelebration } from '@/lib/storySounds';
import { useReveal } from '@/hooks/useReveal';
import { SectionTitle } from './SectionTitle';

const W = 400;
const H = 480;

function ScratchCard({ index, onOpen }: { index: number; onOpen: () => void }) {
  const memory = scratchMemories[index]!;
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const checked = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const [spark, setSpark] = useState<{ x: number; y: number } | null>(null);
  const { ref, shown } = useReveal(0.2);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d', { willReadFrequently: true });
    if (!ctx || !el) return;
    const css = getComputedStyle(document.documentElement);
    const gold = css.getPropertyValue('--journal-gold').trim();
    const light = css.getPropertyValue('--foil-highlight').trim();
    const shade = css.getPropertyValue('--journal-wine').trim();
    const foil = ctx.createLinearGradient(0, 0, W, H);
    foil.addColorStop(0, gold); foil.addColorStop(.35, light); foil.addColorStop(.55, gold); foil.addColorStop(1, shade);
    ctx.fillStyle = foil; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = light; ctx.globalAlpha = .16;
    for (let i = -H; i < W; i += 8) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = shade; ctx.lineWidth = 3; ctx.strokeRect(14, 14, W - 28, H - 28);
    ctx.strokeRect(22, 22, W - 44, H - 44);
    ctx.fillStyle = shade; ctx.textAlign = 'center';
    ctx.font = 'italic 27px Georgia'; ctx.fillText('Scratch to Reveal', W / 2, H / 2 - 30);
    ctx.font = 'italic 22px Georgia'; ctx.fillText('Our Memory ✨', W / 2, H / 2 + 6);
    ctx.font = '26px Georgia'; ctx.fillText('♥', W / 2, H / 2 + 48);
  }, []);

  const assess = () => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx || revealed) return;
    const pixels = ctx.getImageData(0, 0, W, H).data;
    let cleared = 0; let total = 0;
    for (let i = 3; i < pixels.length; i += 64) { total++; if ((pixels[i] ?? 255) < 80) cleared++; }
    if (dissolveRevealed(cleared, total)) { setRevealed(true); setSpark(null); playCelebration(); }
  };
  const erase = (x: number, y: number, from = last.current) => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx || revealed) return;
    ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 56; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(from?.x ?? x, from?.y ?? y); ctx.lineTo(x, y); ctx.stroke();
    last.current = { x, y };
    const now = performance.now();
    if (now - checked.current > 160) { checked.current = now; setSpark({ x: x / 4, y: y / 4.8 }); assess(); }
  };
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  };

  return (
    <div ref={ref as React.Ref<HTMLDivElement>} className={`scratch-memory reveal ${shown ? 'reveal-in' : ''}`} style={{ transitionDelay: `${index * 90}ms` }}>
      <span className="scratch-memory-badge">Memory {memory.numeral} · Hidden Keepsake</span>
      <div className={`scratch-memory-frame ${revealed ? 'is-revealed' : ''}`}>
        <button type="button" className="scratch-memory-photo" onClick={() => revealed && onOpen()} aria-label={revealed ? `Open memory: ${memory.title}` : memory.title} disabled={!revealed}>
          {memory.image ? <img src={memory.image} alt={memory.title} loading="lazy" /> : <span className="text-xs tracking-widest text-warm/40">[ add photo ]</span>}
        </button>
        {!revealed && (
          <canvas ref={canvas} width={W} height={H} className="scratch-memory-foil" role="img" aria-label={`Gold foil covering memory ${memory.numeral}. Rub to reveal.`}
            onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); const p = point(e); last.current = p; erase(p.x, p.y); }}
            onPointerMove={e => { if (last.current) { const p = point(e); erase(p.x, p.y); } }}
            onPointerUp={() => { last.current = null; setSpark(null); assess(); }}
            onPointerCancel={() => { last.current = null; setSpark(null); assess(); }} />
        )}
        {spark && !revealed && <span className="scratch-sparks" style={{ left: `${spark.x}%`, top: `${spark.y}%` }} aria-hidden="true">{Array.from({ length: 6 }, (_, i) => <i key={i} style={{ '--spark-index': i } as React.CSSProperties}>✦</i>)}</span>}
        {revealed && <span className="scratch-revealed-badge">Revealed ❤️</span>}
        {revealed && <span className="scratch-burst" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} style={{ '--spark-index': i } as React.CSSProperties}>{i % 2 ? '✦' : '❤'}</i>)}</span>}
      </div>
      <p className="script scratch-memory-caption">{memory.caption}</p>
    </div>
  );
}

export function ScratchGallery() {
  const [active, setActive] = useState<number | null>(null);
  const memory = active === null ? null : scratchMemories[active]!;
  return (
    <section className="relative px-5 py-24">
      <SectionTitle kicker="Memory Gallery" title="Scratch to Reveal Our Memories" />
      <div className="mx-auto mt-12 grid max-w-md grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-5">
        {scratchMemories.map((m, i) => <ScratchCard key={m.title} index={i} onOpen={() => setActive(i)} />)}
      </div>
      {memory && (
        <div className="lightbox px-4 pb-6 pt-24" role="dialog" aria-modal="true" onClick={() => setActive(null)}>
          <button type="button" aria-label="Close" className="absolute left-5 top-5 rounded-full border border-warm/20 p-2 text-warm/80" onClick={() => setActive(null)}><X className="size-5" /></button>
          <div className="animate-scale-in px-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="lightbox-frame">
              {memory.image ? <img src={memory.image} alt={memory.title} className="size-full object-contain" /> : <span className="text-xs tracking-widest text-warm/40">[ add photo ]</span>}
            </div>
            <p className="mt-6 font-display text-sm uppercase tracking-[0.3em] text-gold-soft">Memory {memory.numeral} · {memory.title}</p>
            <p className="script mt-2 text-2xl text-gold-soft">{memory.caption}</p>
          </div>
        </div>
      )}
    </section>
  );
}
