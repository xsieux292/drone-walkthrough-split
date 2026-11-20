import { Directive, effect, input, untracked } from '@angular/core';
import { Sequencer, prefersReducedMotion } from '../util/sequencer';

/**
 * Base class for every step. The shell owns the clock and feeds two inputs:
 *   active  the step is the current one (in view / on screen)
 *   beat    which sub-step (0-based) is playing
 *
 * Each step implements:
 *   settle(n)  set every signal to the END state of beats 0..n-1 at once (no animation)
 *   animate(b) animate beat b from that settled state, using this.seq
 *
 * So jumping backwards, skipping ahead or reduced motion all work: play(b) = settle(b) + animate(b).
 * Leaving the step cancels its animation and keeps whatever is on screen.
 */
@Directive()
export abstract class DwStepBase {
  readonly active = input(false);
  readonly beat = input(0);

  protected readonly seq = Sequencer.create();
  protected readonly reduced = prefersReducedMotion();

  constructor() {
    effect(() => {
      const active = this.active();
      const beat = this.beat();
      untracked(() => {
        if (!active) {
          this.seq.cancel();
          return;
        }
        this.settle(beat);
        if (this.reduced) this.settle(beat + 1);
        else this.animate(beat);
      });
    });
  }

  protected abstract settle(beatsDone: number): void;
  protected abstract animate(beat: number): void;
}
