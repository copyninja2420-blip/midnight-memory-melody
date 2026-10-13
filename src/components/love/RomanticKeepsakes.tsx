import { useEffect, useRef, useState } from 'react';
import { Mic, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { playCelebration } from '@/lib/storySounds';

const stars = [[50, 82], [31, 66], [17, 43], [22, 24], [38, 20], [50, 34], [62, 20], [78, 24], [83, 43], [69, 66]];
export function RomanticKeepsakes() {
  const [connected, setConnected] = useState<number[]>([]);
  const [recording, setRecording] = useState<string | null>(null);
  const [name, setName] = useState('A moment, in your voice');
  const input = useRef<HTMLInputElement>(null);
  const url = useRef<string | null>(null);
  useEffect(() => () => { if (url.current) URL.revokeObjectURL(url.current); }, []);
  const complete = connected.length === stars.length;
  return <section className="romantic-keepsakes mx-auto max-w-2xl px-5 py-16">
    <div className="constellation-keepsake">
      <p className="script text-3xl text-gold-soft">Constellation of Us</p>
      <div className="constellation-sky">
        <div className="constellation-dust" aria-hidden="true">{Array.from({ length: 48 }, (_, i) => <i key={i} style={{ left: `${(i * 37 + 3) % 100}%`, top: `${(i * 61 + 9) % 100}%`, animationDelay: `${i % 7}s` }} />)}</div>
        <svg viewBox="0 0 100 100" aria-hidden="true"><path className={complete ? 'constellation-complete' : ''} d={stars.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ') + ' Z'} />{stars.map(([x, y], i) => { const next = stars[(i + 1) % stars.length]; return connected.includes(i) && connected.includes((i + 1) % stars.length) && next ? <line key={i} x1={x} y1={y} x2={next[0]} y2={next[1]} /> : null; })}</svg>
        {stars.map(([x, y], i) => <Button variant="ghost" key={i} className={`constellation-star ${connected.includes(i) ? 'is-connected' : ''}`} style={{ left: `${x}%`, top: `${y}%` }} aria-label={`Connect star ${i + 1}`} aria-pressed={connected.includes(i)} onClick={() => { if (!connected.includes(i)) { if (connected.length === stars.length - 1) playCelebration(); setConnected(c => [...c, i]); } }}>✦</Button>)}
      </div>
      <p className="script text-2xl text-warm" aria-live="polite">{complete ? 'Even the stars spell us.' : 'Under the same sky, always.'}</p>
    </div>
    <div className="voice-keepsake mt-12">
      <Mic className="size-6 text-gold-soft" />
      <h2 className="script text-3xl text-gold-soft">A Whisper, Just for You</h2>
      <p className="mt-2 font-serif text-sm text-warm/70">{name}</p>
      {recording && <audio controls src={recording} className="voice-player mt-5" />}
      <input ref={input} type="file" accept="audio/*" aria-label="Choose a voice moment" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (!file) return; if (url.current) URL.revokeObjectURL(url.current); url.current = URL.createObjectURL(file); setRecording(url.current); setName(file.name.replace(/\.[^.]+$/, '')); }} />
      <Button variant="outline" onClick={() => input.current?.click()} className="mt-5 border-gold-soft/40 bg-transparent text-gold-soft hover:bg-gold-soft/10"><Plus className="size-4" />{recording ? 'Replace voice moment' : 'Add a voice moment'}</Button>
    </div>
  </section>;
}