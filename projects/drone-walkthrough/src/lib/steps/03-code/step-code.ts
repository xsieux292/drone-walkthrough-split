import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { DW_DEFAULT_CONTENT } from '../../content.default';
import { CodeContent } from '../../models';
import { linear } from '../../util/sequencer';
import { DwStepBase } from '../step-base';
import { DwCodeEditor } from './parts/code-editor';
import { DwTrainViz } from './parts/train-viz';

/* ════════════════════════════════════════════════════════════════════════════════
 * STEP 3.3.3 · เขียนโค้ด และ fine-tune โมเดล
 *
 * This file = the TIMELINE only. Two scenes cross-fade on one stage:
 *   parts/code-editor.*   scene "editor": IDE window typing the files in content.code.files
 *   parts/train-viz.*     scene "train":  dataset → model block → boxes converge, charts, weights card
 *
 * Beats (labels + durations: content.default.ts → steps[2].beats):
 *   0  type files[0] (train.py), then terminal lines appear
 *   1  type files[1] (my_agent.py)
 *   2  switch to the training scene, images start flowing
 *   3  training run: progress 0 → 1 (epochs, boxes, charts)
 *   4  weights card pops out
 * ════════════════════════════════════════════════════════════════════════════════ */

// ── Timing (ms) ──
const T = {
  typeChar: 14, // per character of code
  typeMax: 4200, // cap so long files still fit in the beat
  termLineEvery: 220,
  trainRun: 5400, // whole training animation (beat 3); keep below the beat's ms
};

@Component({
  selector: 'dw-step-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DwCodeEditor, DwTrainViz],
  template: `
    <!-- STEP 3.3.3 stage: two scenes, only one has .on -->
    <dw-code-editor
      class="scene"
      [class.on]="scene() === 'editor'"
      [files]="content().files"
      [fileIndex]="fileIndex()"
      [typed]="typed()"
      [terminal]="content().terminal"
      [termLines]="termLines()"
    />
    <dw-train-viz class="scene" [class.on]="scene() === 'train'" [train]="content().train" [progress]="progress()" [feeding]="feeding()" [weights]="weights()" />
  `,
  styles: `
    @use '../step-common' as *;
    :host { @include stage-host; background: #070b18; }
    /* scene cross-fade */
    .scene { opacity: 0; transform: scale(.98); transition: opacity .6s, transform .6s; pointer-events: none; }
    .scene.on { opacity: 1; transform: none; }
  `,
})
export class DwStepCode extends DwStepBase {
  readonly content = input<CodeContent>(DW_DEFAULT_CONTENT.code);

  // ── State read by the parts ──
  protected readonly scene = signal<'editor' | 'train'>('editor');
  protected readonly fileIndex = signal(0);
  protected readonly typed = signal(0);
  protected readonly termLines = signal(0);
  protected readonly feeding = signal(false);
  protected readonly progress = signal(0);
  protected readonly weights = signal(false);

  protected settle(n: number): void {
    const files = this.content().files;
    const file = n >= 2 ? Math.min(1, files.length - 1) : 0;
    this.scene.set(n >= 3 ? 'train' : 'editor');
    this.fileIndex.set(file);
    this.typed.set(n >= 1 ? (files[file]?.code.length ?? 0) : 0);
    this.termLines.set(n >= 1 ? this.content().terminal.length : 0);
    this.feeding.set(n >= 3);
    this.progress.set(n >= 4 ? 1 : 0);
    this.weights.set(n >= 5);
  }

  protected animate(beat: number): void {
    const files = this.content().files;
    this.seq.run(async (s) => {
      switch (beat) {
        // ── beats 0 / 1 · type a file ──
        case 0:
        case 1: {
          const i = Math.min(beat, files.length - 1);
          const len = files[i]?.code.length ?? 0;
          this.scene.set('editor');
          this.fileIndex.set(i);
          this.typed.set(0);
          await s.wait(350);
          await s.tween(Math.min(T.typeMax, len * T.typeChar), (t) => this.typed.set(Math.round(t * len)), linear);
          if (beat === 0) {
            for (let k = 1; k <= this.content().terminal.length; k++) {
              await s.wait(T.termLineEvery);
              this.termLines.set(k);
            }
          }
          break;
        }
        // ── beat 2 · into the training scene ──
        case 2: {
          this.scene.set('train');
          await s.wait(400);
          this.feeding.set(true);
          break;
        }
        // ── beat 3 · the training run ──
        case 3: {
          this.feeding.set(true);
          await s.wait(200);
          await s.tween(T.trainRun, (t) => this.progress.set(t), linear);
          break;
        }
        // ── beat 4 · weights ready ──
        case 4: {
          this.feeding.set(false);
          await s.wait(300);
          this.weights.set(true);
          break;
        }
      }
    });
  }
}
