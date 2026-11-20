import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { DW_DEFAULT_CONTENT } from '../../content.default';
import { ResultsContent } from '../../models';
import { DwMediaSlot } from '../../shared/media-slot';
import { DwStepBase } from '../step-base';
import { DwResultFiles } from './parts/result-files';
import { DwScoreTable } from './parts/score-table';

/* ════════════════════════════════════════════════════════════════════════════════
 * STEP 3.3.6 · บินจริง รับคะแนน และไฟล์ผลลัพธ์
 *
 * This file = the TIMELINE only.
 * Visual pieces:
 *   step-results.html / .scss   video frame + its three positions (big / top-left), where the cards sit
 *   parts/score-table.ts        score table (content.results.scores, sample stamp)
 *   parts/result-files.ts       files received (content.results.files)
 *   shared/media-slot           the flight clip (content.results.video, marked ต้องเปลี่ยน)
 *
 * Beats (labels + durations: content.default.ts → steps[5].beats):
 *   0  flight clip plays large
 *   1  clip shrinks to the left, score table slides in and counts up
 *   2  file cards pop in under the clip
 * ════════════════════════════════════════════════════════════════════════════════ */

// ── Timing (ms) ──
const T = {
  layoutMove: 500, // wait for the clip to shrink (.video transition is 0.7s)
  countUp: 1400,
  fileEvery: 220,
};

/** Stage layouts, one per beat. CSS classes .at-video / .at-table / .at-files in step-results.scss. */
type Layout = 'video' | 'table' | 'files';

@Component({
  selector: 'dw-step-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DwMediaSlot, DwScoreTable, DwResultFiles],
  templateUrl: './step-results.html',
  styleUrl: './step-results.scss',
})
export class DwStepResults extends DwStepBase {
  readonly content = input<ResultsContent>(DW_DEFAULT_CONTENT.results);

  // ── State read by the template / parts ──
  protected readonly layout = signal<Layout>('video');
  protected readonly count = signal(0);
  protected readonly filesShown = signal(0);

  protected settle(n: number): void {
    this.layout.set(n >= 2 ? 'files' : n >= 1 ? 'table' : 'video');
    this.count.set(n >= 2 ? 1 : 0);
    this.filesShown.set(n >= 3 ? this.content().files.length : 0);
  }

  protected animate(beat: number): void {
    this.seq.run(async (s) => {
      switch (beat) {
        // ── beat 0 · the clip (plays by itself through media-slot [playing]) ──
        case 0:
          break;
        // ── beat 1 · score table ──
        case 1: {
          this.layout.set('table');
          await s.wait(T.layoutMove);
          await s.tween(T.countUp, (t) => this.count.set(t));
          break;
        }
        // ── beat 2 · files ──
        case 2: {
          this.layout.set('files');
          for (let i = 1; i <= this.content().files.length; i++) {
            await s.wait(T.fileEvery);
            this.filesShown.set(i);
          }
          break;
        }
      }
    });
  }
}
