import { playlist } from "@/content/loveStory";

const AUDIO_KEY = Symbol.for("our-love-journey.audio");
type AudioWindow = Window & { [AUDIO_KEY]?: HTMLAudioElement };

/** One audio element for the whole visit, so music never restarts between screens. */
export function getSharedAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  const host = window as AudioWindow;
  let shared = host[AUDIO_KEY];
  if (!shared) {
    shared = new Audio();
    shared.preload = "auto";
    shared.volume = 0.4;
    const src = playlist[0]?.src;
    if (src) shared.src = src;
    host[AUDIO_KEY] = shared;
  }
  return shared;
}

/** Called inside the unlock tap so mobile browsers allow real playback right away. */
export function startMusicFromGesture() {
  const a = getSharedAudio();
  if (!a) return;
  a.muted = false;
  if (a.getAttribute("src")) a.play().catch(() => {});
}
