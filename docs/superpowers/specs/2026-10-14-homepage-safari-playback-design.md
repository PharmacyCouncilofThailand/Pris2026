# Homepage Safari playback and scrolling

Approved direction: preserve the existing homepage appearance and fix the four reported behaviors.

## Changes

- Intro: use the existing static conference background while the intro is visible. Start the letter and organizer entrance only after fonts are ready. Keep the white mask at viewport size and zoom its text, rather than scaling the entire blended background. Cancel pending font callbacks on unmount. Reduced motion skips the cinematic sequence.
- Hero video: initialize muted playback explicitly after the intro finishes. Retry when media becomes ready, enters the viewport, or the tab becomes visible. Hide the video until playback actually starts so the static background covers browser playback overlays.
- Interviews: play only the active, visible slide. Pause inactive/offscreen videos. Keep playback intent separate from actual playback state. Use the existing controls for manual playback when autoplay fails, and invoke playback directly from user controls to preserve Safari user activation.
- Agenda: allow vertical scroll chaining at both ends while containing horizontal overscroll.

## Boundaries

Preserve colors, fonts, content, carousel layout, video URLs, and the existing dropdown changes. No additional dependencies, UA detection, autoplay bypass, or unrelated redesign.

## Validation plan

1. Exercise playback initialization, readiness retries, viewport exit/reentry, tab visibility, rejection, intentional pause, and cleanup with mocked media events.
2. Check rendered carousel state and controls, stale requests after slide changes, and keyboard behavior.
3. Run relevant tests, lint, TypeScript, and production build; distinguish existing environment failures.
4. Inspect the homepage in available browsers at desktop/mobile sizes, including first-visit intro and table boundary scrolling. Explicitly report any Safari checks that cannot be performed.

## Limitations

Browser/user policy can still reject autoplay. The hero must retain its static background and the interviews must retain an accessible manual Play control in that case. Runtime smoothness and actual media decoding require browser validation in addition to unit tests.
