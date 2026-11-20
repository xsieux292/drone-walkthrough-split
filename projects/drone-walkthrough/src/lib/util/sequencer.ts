import { DestroyRef, inject } from '@angular/core';

/** True when the viewer asked the OS for less motion. Steps then jump straight to their end state. */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Runs one cancellable animation script at a time. Each step component owns one; starting a new
 * script (a new beat) cancels the previous one, so a fast ▶ click never leaves two timelines running.
 *
 *   this.seq.run(async (s) => { await s.wait(300); this.x.set(1); await s.tween(800, (t) => this.p.set(t)); });
 */
export class Sequencer {
  private token = 0;
  private readonly timers = new Set<ReturnType<typeof setTimeout>>();
  private readonly frames = new Set<number>();

  constructor(destroyRef?: DestroyRef) {
    destroyRef?.onDestroy(() => this.cancel());
  }

  /** Create a Sequencer tied to the current injection context's lifetime. */
  static create(): Sequencer {
    return new Sequencer(inject(DestroyRef));
  }

  cancel(): void {
    this.token++;
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    if (typeof cancelAnimationFrame === 'function') this.frames.forEach(cancelAnimationFrame);
    this.frames.clear();
  }

  run(script: (s: SequenceScope) => Promise<void>): void {
    this.cancel();
    const my = this.token;
    const alive = () => my === this.token;
    const scope: SequenceScope = {
      alive,
      wait: (ms) =>
        new Promise<void>((resolve, reject) => {
          const t = setTimeout(() => {
            this.timers.delete(t);
            alive() ? resolve() : reject(CANCELLED);
          }, ms);
          this.timers.add(t);
        }),
      tween: (ms, onFrame, ease = easeInOut) =>
        new Promise<void>((resolve, reject) => {
          if (typeof requestAnimationFrame !== 'function' || ms <= 0) {
            onFrame(1);
            resolve();
            return;
          }
          const start = performance.now();
          const tick = (now: number) => {
            if (!alive()) return reject(CANCELLED);
            const t = Math.min(1, (now - start) / ms);
            onFrame(ease(t));
            if (t < 1) this.frames.add(requestAnimationFrame(tick));
            else resolve();
          };
          this.frames.add(requestAnimationFrame(tick));
        }),
    };
    script(scope).catch((e) => {
      if (e !== CANCELLED) console.error(e);
    });
  }
}

export interface SequenceScope {
  alive(): boolean;
  wait(ms: number): Promise<void>;
  /** Calls onFrame(t) with eased t from 0 to 1 over ms. */
  tween(ms: number, onFrame: (t: number) => void, ease?: (t: number) => number): Promise<void>;
}

const CANCELLED = Symbol('cancelled');

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const linear = (t: number) => t;
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
