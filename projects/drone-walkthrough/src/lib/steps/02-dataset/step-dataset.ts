import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DW_DEFAULT_CONTENT } from '../../content.default';
import { DatasetContent } from '../../models';
import { DwBrowserFrame } from '../../shared/browser-frame';
import { DwCursor } from '../../shared/cursor';
import { DwMediaSlot } from '../../shared/media-slot';
import { CursorState, hiddenCursor, moveAndClick, placeCursor } from '../../util/cursor-script';
import { linear } from '../../util/sequencer';
import { DwStepBase } from '../step-base';
import { DwDownloadTerminal } from './parts/download-terminal';
import { DwHfPage, HfAccess } from './parts/hf-page';

/* ════════════════════════════════════════════════════════════════════════════════
 * STEP 3.3.2 · รับสิทธิ์เข้าถึง dataset
 *
 * This file = the TIMELINE only.
 * Visual pieces:
 *   step-dataset.html / .scss    stage layout: dark browser + "real screenshot" overlay
 *   parts/hf-page.*              mock Hugging Face page (gate, files, toast)
 *   parts/download-terminal.ts   terminal with the download command + progress bar
 *   shared/media-slot            the real screenshot (content.dataset.media, marked ต้องเปลี่ยน)
 *
 * Beats (labels + durations: content.default.ts → steps[1].beats):
 *   0  gated page shows, cursor appears
 *   1  cursor clicks "Agree and access repository" → spinner → access granted
 *   2  file rows slide in, toast shows then hides
 *   3  terminal slides up, types the command, zip downloads to 100%
 *   4  the real screenshot fades in over the mock
 * ════════════════════════════════════════════════════════════════════════════════ */

// ── Layout (stage px) ──
/** Centre of the gate button (browser left 30 + body width 900/2, body top 60 + gate centre 280 + 36). */
const BUTTON = { x: 480, y: 376 };
const CURSOR_START = { x: 700, y: 240 };

// ── Timing (ms) ──
const T = {
  loading: 1100, // spinner on the button before access is granted
  rowEvery: 260, // file rows slide in at this interval
  toastHold: 1400,
  typeChar: 28, // download command typing speed
  download: 2000, // progress bar 0 → 100 %
};

@Component({
  selector: 'dw-step-dataset',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DwBrowserFrame, DwMediaSlot, DwCursor, DwHfPage, DwDownloadTerminal],
  templateUrl: './step-dataset.html',
  styleUrl: './step-dataset.scss',
})
export class DwStepDataset extends DwStepBase {
  readonly content = input<DatasetContent>(DW_DEFAULT_CONTENT.dataset);

  // ── State read by the template / parts ──
  protected readonly access = signal<HfAccess>('locked');
  protected readonly rows = signal(0);
  protected readonly toast = signal(false);
  protected readonly terminal = signal(false);
  protected readonly typed = signal(0);
  protected readonly progress = signal(0);
  protected readonly real = signal(false);
  protected readonly cursor = signal<CursorState>(hiddenCursor());

  protected readonly url = computed(() => `huggingface.co/datasets/${this.content().owner || '<org>'}/${this.content().repo}`);
  /** The last file in the list is treated as the big dataset archive. */
  protected readonly bigFile = computed(() => this.content().files.at(-1)?.name ?? 'dataset.zip');

  protected settle(n: number): void {
    this.access.set(n >= 2 ? 'granted' : 'locked');
    this.rows.set(n >= 3 ? this.content().files.length : 0);
    this.toast.set(false);
    this.terminal.set(n >= 4);
    this.typed.set(n >= 4 ? this.content().downloadCommand.length : 0);
    this.progress.set(n >= 4 ? 1 : 0);
    this.real.set(n >= 5);
    this.cursor.set(hiddenCursor(CURSOR_START));
  }

  protected animate(beat: number): void {
    this.seq.run(async (s) => {
      switch (beat) {
        // ── beat 0 · the gated page ──
        case 0: {
          await s.wait(600);
          placeCursor(this.cursor, CURSOR_START);
          break;
        }
        // ── beat 1 · click "Agree and access repository" ──
        case 1: {
          placeCursor(this.cursor, CURSOR_START);
          await s.wait(100);
          this.cursor.set({ ...BUTTON, show: true, click: false });
          await s.wait(850);
          this.access.set('loading');
          await moveAndClick(s, this.cursor, BUTTON, 0);
          await s.wait(T.loading);
          this.access.set('granted');
          this.toast.set(true);
          break;
        }
        // ── beat 2 · files appear ──
        case 2: {
          this.toast.set(true);
          for (let i = 1; i <= this.content().files.length; i++) {
            await s.wait(T.rowEvery);
            this.rows.set(i);
          }
          await s.wait(T.toastHold);
          this.toast.set(false);
          break;
        }
        // ── beat 3 · download in the terminal ──
        case 3: {
          const len = this.content().downloadCommand.length;
          this.terminal.set(true);
          await s.wait(450);
          await s.tween(len * T.typeChar, (t) => this.typed.set(Math.round(t * len)), linear);
          await s.wait(250);
          await s.tween(T.download, (t) => this.progress.set(t));
          break;
        }
        // ── beat 4 · the real screenshot ──
        case 4: {
          await s.wait(200);
          this.real.set(true);
          break;
        }
      }
    });
  }
}
