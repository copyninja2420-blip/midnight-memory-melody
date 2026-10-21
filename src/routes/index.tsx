import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import PasswordGate from "@/PasswordGate";
import { journal } from "@/content/loveStory";
import { Atmosphere } from "@/components/love/Atmosphere";
import { LoveMeterScreen } from "@/components/love/LoveMeterScreen";
import { Finale } from "@/components/love/Finale";
import { Gallery } from "@/components/love/Gallery";
import { HeartTap } from "@/components/love/HeartTap";
import { LoveLetter } from "@/components/love/LoveLetter";
import { MusicToggle } from "@/components/love/MusicToggle";
import { BirthdayCake } from "@/components/love/BirthdayCake";
import { SecretGateway } from "@/components/love/SecretGateway";
import { WhatsAppReaction } from "@/components/love/WhatsAppReaction";
import { AvatarJourney } from "@/components/love/AvatarJourney";
import { DestinyEntry, type DestinyNames } from "@/components/love/DestinyEntry";
import { ClosedCover } from "@/components/love/ClosedCover";
import { Timeline } from "@/components/love/Timeline";
import { Reasons } from "@/components/love/Reasons";
import { Prologue } from "@/components/love/Prologue";
import { GiftVault } from "@/components/love/GiftVault";
import { LoveTimer } from "@/components/love/LoveTimer";
import { DestinyNotebook } from "@/components/love/DestinyNotebook";
import { playPageTurn, preloadStorySounds } from "@/lib/storySounds";
import { RomanticKeepsakes } from "@/components/love/RomanticKeepsakes";
import { ScratchNote } from '@/components/love/ScratchNote';
import { LoveCoupons } from '@/components/love/LoveCoupons';
import { TimeCapsule } from '@/components/love/TimeCapsule';
import { MemoryCompass } from '@/components/love/MemoryCompass';
import { JourneySecret, SecretCrest } from '@/components/love/SecretCrest';

const PageCurl = lazy(() => import("@/components/love/PageCurl"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Our Love Journey — A Private Diary" },
      {
        name: "description",
        content: "A private, cinematic birthday love letter.",
      },
      { property: "og:title", content: "Our Love Journey" },
      {
        property: "og:description",
        content: "A romantic interactive birthday surprise.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoveStoryPage,
});

type Stage = "closed" | "cover" | "cake" | "avatar" | "scanner" | "names" | "notebook" | "prologue" | "story";
const CHAPTERS: { stage: Stage; label: string }[] = [
  { stage: "cover", label: "I · Our Story" },
  { stage: "cake", label: "II · Wish" },
  { stage: "scanner", label: "III · Hearts" },
  { stage: "names", label: "IV · Names" },
  { stage: "notebook", label: "V · Destiny" },
  { stage: "avatar", label: "VI · Us" },
  { stage: "prologue", label: "VII · For You" },
  { stage: "story", label: "VIII · Memories" },
];

function LoveStoryPage() {
  const [stage, setStageRaw] = useState<Stage>("closed");
  const [reached, setReached] = useState(0);
  const [turning, setTurning] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const turnLock = useRef(false);
  const [names, setNames] = useState<DestinyNames>({ yourName: "", partnerName: "" });
  const setStage = useCallback((next: Stage) => {
    if (turnLock.current || next === stage) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    turnLock.current = true;
    playPageTurn();
    const i = CHAPTERS.findIndex((c) => c.stage === next);
    setReached((r) => Math.max(r, i));
    timers.current.push(setTimeout(() => setStageRaw(next), reduced ? 0 : 420));
    timers.current.push(setTimeout(() => { setTurning(null); turnLock.current = false; }, reduced ? 20 : 1350));
    setTurning(reduced ? null : journal.chapters[CHAPTERS.findIndex((c) => c.stage === stage)] ?? journal.title);
  }, [stage]);
  const toNames = useCallback(() => setStage("names"), [setStage]);
  useEffect(() => {
    preloadStorySounds();
    void import("@/components/love/PageCurl");
    void import("@/components/love/CrystalHeart").then(module => module.preloadCrystalHeart());
    void import("@/components/love/avatar/HumanoidScene");
    void import("@/components/love/companion/CompanionScene");
    return () => timers.current.forEach(clearTimeout);
  }, []);
  useEffect(() => {
    if (!turning) return;
    const failsafe = setTimeout(() => { setTurning(null); turnLock.current = false; }, 1450);
    return () => clearTimeout(failsafe);
  }, [turning]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [stage]);

  return (
    <main className="diary-book relative min-h-[100svh] overflow-x-hidden bg-background text-foreground" data-journey={stage}>
      {/* One music player for the whole visit — starts on unlock, never restarts */}
      <MusicToggle autoplay />
      <JourneySecret />
      {stage !== 'story' && <Atmosphere particles={8} hearts={3} />}
      <div className="journal-corners" aria-hidden="true"><span>❧</span><span>❧</span><span>❧</span><span>❧</span></div>

      {stage !== "cover" && stage !== "closed" && <nav className="diary-ribbons" aria-label="Diary chapters">
        {CHAPTERS.map((c, i) => {
          const locked = i > reached || (c.stage === "notebook" && !names.yourName);
          return (
            <Button variant="ghost" key={c.stage} type="button" title={c.label} aria-label={c.label} disabled={locked || !!turning} aria-current={stage === c.stage ? "page" : undefined} onClick={() => setStage(c.stage)} className="diary-ribbon">
              <span>{["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][i]}</span>
            </Button>
          );
        })}
      </nav>}

      <div key={stage} className={stage === "cover" ? "diary-page cover-reveal" : "diary-page"}>
      {stage === "closed" && <ClosedCover onOpen={() => setStageRaw("cover")} />}
      {stage === "cover" && <PasswordGate onUnlock={() => setStage("cake")} />}
      {stage === "cake" && <BirthdayCake onEnter={() => setStage("scanner")} />}
      {stage === "avatar" && <AvatarJourney onNext={() => setStage("prologue")} />}
      {stage === "scanner" && <LoveMeterScreen onContinue={toNames} />}
      {stage === "names" && <DestinyEntry onCalculate={(value) => { setNames(value); setStage("notebook"); }} />}
      {stage === "notebook" && <DestinyNotebook names={names} onReveal={() => setStage("avatar")} />}
      {stage === "prologue" && <Prologue onEnter={() => setStage("story")} />}

      {stage === "story" && (
        <div className="diary-memories">
          <HeartTap />
          <div className="relative z-10">
            <LoveTimer />
            <Timeline />
            <Reasons />
            <Gallery />
            <ScratchNote />
            <GiftVault />
            <LoveCoupons />
            <TimeCapsule />
            <MemoryCompass />
            <RomanticKeepsakes />
            <LoveLetter />
            <Finale />
            <div className="story-crest-slot"><SecretCrest /></div>
            <SecretGateway />
            <WhatsAppReaction />
          </div>
        </div>
      )}
      </div>
      {turning && <Suspense fallback={<div className="page-turn-fallback" aria-hidden="true" />}><PageCurl title={turning} /></Suspense>}
    </main>
  );
}
