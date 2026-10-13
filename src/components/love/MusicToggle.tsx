import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Plus, SkipForward, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playlist as bundledPlaylist, type Track } from "@/content/loveStory";
import {
  addStoredTracks,
  listStoredTracks,
  removeStoredTrack,
  type StoredTrack,
} from "@/lib/musicLibrary";
import { getSharedAudio } from "@/lib/musicUnlock";

type UserTrack = Track & { id: string };

export function MusicToggle({ autoplay }: { autoplay: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [userTracks, setUserTracks] = useState<UserTrack[]>([]);
  const [manage, setManage] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [uploadError, setUploadError] = useState("");
  const objectUrls = useRef(new Set<string>());

  const [ready, setReady] = useState(false);
  const advanceRef = useRef<() => void>(() => {});
  const autoNextRef = useRef(false);

  useEffect(() => {
    const el = getSharedAudio();
    if (!el) return;
    audioRef.current = el;
    setPlaying(!el.paused);
    setVolume(el.volume);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    const onEnded = () => {
      autoNextRef.current = true;
      advanceRef.current();
    };
    el.addEventListener("ended", onEnded);
    setReady(true);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  const toUserTrack = (t: StoredTrack): UserTrack => {
    const src = URL.createObjectURL(t.blob);
    objectUrls.current.add(src);
    return { id: t.id, title: t.title, src };
  };

  useEffect(() => {
    let cancelled = false;
    listStoredTracks()
      .then((stored) => {
        if (!cancelled) setUserTracks(stored.map(toUserTrack));
      })
      .catch(() => undefined);
    return () => { cancelled = true; objectUrls.current.forEach((url) => URL.revokeObjectURL(url)); };
  }, []);

  const playlist = useMemo<Track[]>(
    () => [...bundledPlaylist, ...userTracks],
    [userTracks],
  );
  const track = playlist[Math.min(index, playlist.length - 1)];

  useEffect(() => {
    if (!ready || !autoplay || !audioRef.current) return;
    if (!audioRef.current.paused) return;
    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [autoplay, ready]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    if (el.src === new URL(track.src, window.location.href).href) return;
    const wasPlaying = !el.paused || autoNextRef.current;
    autoNextRef.current = false;
    el.src = track.src;
    el.load();
    if (wasPlaying) el.play().catch(() => setPlaying(false));
  }, [ready, index, track?.src]);

  const advance = () => setIndex((i) => (playlist.length ? (i + 1) % playlist.length : 0));
  advanceRef.current = advance;

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (!track) { fileRef.current?.click(); return; }
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.volume = volume;
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const next = () => {
    advance();
    const el = audioRef.current;
    if (el && playing) {
      window.setTimeout(() => {
        el.volume = volume;
        el.play().catch(() => setPlaying(false));
      }, 0);
    }
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const audioFiles = Array.from(files).filter(
      (f) => f.type.startsWith("audio/") || /\.(mp3|m4a|wav|ogg)$/i.test(f.name),
    );
    if (audioFiles.length === 0) { setUploadError("Choose an audio file."); return; }
    if (audioFiles.some((file) => file.size > 20 * 1024 * 1024)) { setUploadError("Please choose songs under 20 MB."); return; }
    try {
      const added = await addStoredTracks(audioFiles);
      const wasEmpty = playlist.length === 0;
      setUserTracks((prev) => [...prev, ...added.map(toUserTrack)]);
      if (wasEmpty) { autoNextRef.current = true; setIndex(0); }
      setManage(true);
      setUploadError("");
    } catch { setUploadError("This song couldn’t be saved. Please try again."); }
    if (fileRef.current) fileRef.current.value = "";
  };

  const remove = async (id: string) => {
    await removeStoredTrack(id);
    const removed = userTracks.find((t) => t.id === id);
    if (removed) { URL.revokeObjectURL(removed.src); objectUrls.current.delete(removed.src); }
    setUserTracks((prev) => {
      const list = prev.filter((t) => t.id !== id);
      setIndex(0);
      return list;
    });
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => void onFiles(e.target.files)}
      />
      <div className="music-toggle journey-pill flex flex-col gap-1" data-manage={manage}>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause music" : "Play music"}
            title={playing ? "Pause music" : "Play music"}
            variant="ghost"
            className="h-auto flex-1 justify-start px-1 py-1 text-inherit hover:bg-transparent hover:text-inherit"
          >
            {playing && track ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            <span className="max-w-[10rem] truncate text-[0.7rem]">
              {track ? track.title : "Add your songs ♪"}
            </span>
          </Button>
          <Button
            type="button"
            onClick={next}
            aria-label="Next song"
            title="Next song"
            variant="ghost"
            size="icon"
            className="size-7 text-inherit opacity-70 hover:bg-transparent hover:text-inherit hover:opacity-100"
          >
            <SkipForward className="size-4" />
          </Button>
          <Button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Add your own songs"
            title="Add your own songs"
            variant="ghost"
            size="icon"
            className="size-7 text-inherit opacity-70 hover:bg-transparent hover:text-inherit hover:opacity-100"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          aria-label="Music volume"
          onChange={(e) => setVolume(Number(e.target.value))}
          className="music-volume h-1 w-full cursor-pointer"
        />

        {userTracks.length > 0 && (
          <>
            <Button variant="ghost"
              type="button"
              onClick={() => setManage((m) => !m)}
              aria-label={manage ? "Close music library" : "Open music library"}
              className="h-5 px-1 text-left text-[0.6rem] opacity-60"
            >
              {userTracks.length} of your songs
            </Button>
            {manage && (
              <ul className="music-library max-h-40 overflow-y-auto pr-1">
                {userTracks.map((t, i) => (
                  <li key={t.id} className="flex items-center gap-1 py-0.5">
                    <Button variant="ghost"
                      type="button"
                      onClick={() => setIndex(bundledPlaylist.length + i)}
                      className={`h-7 flex-1 justify-start truncate text-left text-[0.65rem] ${i + bundledPlaylist.length === index ? "opacity-100" : "opacity-60"}`}
                    >
                      {t.title}
                    </Button>
                    <Button variant="ghost" size="icon"
                      type="button"
                      aria-label={`Remove ${t.title}`}
                      onClick={() => void remove(t.id)}
                      className="size-7 opacity-60"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {uploadError && <p role="alert" className="max-w-56 text-xs text-rose-soft">{uploadError}</p>}
      </div>
    </>
  );
}
