<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the 3D companion in normal document flow beside the finale; this prevents it from blocking story text and controls.
- Load QR rendering only in the browser and export its PNG through a canvas keepsake; this preserves SSR safety and avoids screenshot dependencies.
- Keep all seven journal chapters, including the cover/passcode, as sequential index-page states with one mounted music player and shared audio element; this avoids audio interruption throughout the journey.
- Load the curved Three.js page-turn overlay dynamically in the browser and keep it outside chapter content; this preserves SSR safety and continuous audio.
- Keep the bundled playlist empty and play only songs the user adds to the device-local library; the user wants only their own tracks.
- Store the single audio element on a browser-global symbol; this keeps code splitting and hot reload from creating multiple independent music players.
- Keep the classic FLAMES calculator separate from the romantic destiny calculator; this preserves classic behavior while allowing the requested celebratory outcome.
- Use a locally hosted CC0 skinned humanoid for the birthday avatar and animate its bones; this avoids primitive stand-ins and third-party runtime dependencies.
- Open on a closed velvet cover stage before the passcode page, kept outside the chapter ribbons; it is a prelude, not a chapter.
- Keep story sound effects in an independent cached Web Audio context; this prevents page rustles from replacing or pausing the shared music element.
- Portal viewport-wide heart showers to document.body; this avoids clipping and transformed containing blocks in chapter content.
- Keep device-local voice moments separate from the music library and revoke replaced object URLs; this preserves user-owned tracks and releases media resources.
