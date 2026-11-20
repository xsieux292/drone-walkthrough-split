import { WritableSignal } from '@angular/core';
import { SequenceScope } from './sequencer';

/** State of the fake mouse pointer (<dw-cursor>), in stage pixels (960×600 canvas). */
export interface CursorState {
  x: number;
  y: number;
  show: boolean;
  click: boolean;
}

export interface Point {
  x: number;
  y: number;
}

/** A hidden cursor parked at `at`. Use in settle() so no pointer is left on screen. */
export const hiddenCursor = (at: Point = { x: 480, y: 300 }): CursorState => ({ ...at, show: false, click: false });

/** Default cursor timings (ms). Override per call when a move must be faster/slower. */
export const CURSOR_TIMING = {
  /** Time to glide to the target. Matches <dw-cursor> glideMs default (700). */
  glide: 700,
  /** How long the button stays pressed (ripple shows). */
  press: 240,
};

/** Show the cursor at a point without animating to it (e.g. the start of a beat). */
export function placeCursor(cursor: WritableSignal<CursorState>, at: Point): void {
  cursor.set({ ...at, show: true, click: false });
}

/** Glide the cursor to `to`, then press and release. Resolves after the release. */
export async function moveAndClick(
  s: SequenceScope,
  cursor: WritableSignal<CursorState>,
  to: Point,
  glide = CURSOR_TIMING.glide,
  press = CURSOR_TIMING.press,
): Promise<void> {
  cursor.set({ ...to, show: true, click: false });
  await s.wait(glide);
  cursor.update((c) => ({ ...c, click: true }));
  await s.wait(press);
  cursor.update((c) => ({ ...c, click: false }));
}
