import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cancelMusicRequest, getSharedAudio, musicRequested, startMusicFromGesture } from './musicUnlock';

test('opening requests music even before the saved library loads, using one audio element', () => {
  const originalWindow = globalThis.window;
  const originalAudio = globalThis.Audio;
  let plays = 0;
  class FakeAudio {
    preload = ''; volume = 0; src = ''; muted = true;
    getAttribute() { return this.src || null; }
    play() { plays++; return Promise.resolve(); }
  }
  Object.assign(globalThis, { window: {}, Audio: FakeAudio });
  try {
    assert.equal(musicRequested(), false);
    startMusicFromGesture();
    assert.equal(musicRequested(), true);
    assert.equal(plays, 0);
    const audio = getSharedAudio();
    assert.ok(audio);
    audio.src = 'saved-song.wav';
    startMusicFromGesture();
    assert.equal(plays, 1);
    assert.equal(getSharedAudio(), audio);
    assert.equal(audio.muted, false);
    cancelMusicRequest();
    assert.equal(musicRequested(), false);
  } finally {
    Object.assign(globalThis, { window: originalWindow, Audio: originalAudio });
  }
});