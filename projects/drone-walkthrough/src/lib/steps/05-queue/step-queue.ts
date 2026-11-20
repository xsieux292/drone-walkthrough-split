import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DW_DEFAULT_CONTENT } from '../../content.default';
import { QueueContent } from '../../models';
import { DwCursor } from '../../shared/cursor';
import { DwMediaSlot } from '../../shared/media-slot';
import { CursorState, hiddenCursor } from '../../util/cursor-script';
import { DwStepBase } from '../step-base';
import { DwDashboardNav } from './parts/dashboard-nav';
import { DwQueueBoard } from './parts/queue-board';
import { BuildCheckState, DwTarUpload } from './parts/tar-upload';

/* ════════════════════════════════════════════════════════════════════════════════
 * STEP 3.3.5 · รอคิว และส่งไฟล์ tar ผ่าน dashboard
 *
 * This file = the TIMELINE only.
 * Visual pieces:
 *   step-queue.html / .scss   where the parts sit, the draggable tar icon, the "real dashboard" overlay
 *   parts/dashboard-nav.ts    dark sidebar
 *   parts/queue-board.*       queue page (banner + team rows)
 *   parts/tar-upload.*        upload page (drop zone, tar files, checks/build)
 *   shared/media-slot         real dashboard image/video (content.queue.dashboardMedia, marked ต้องเปลี่ยน)
 *
 * Beats (labels + durations: content.default.ts → steps[4].beats):
 *   0  teams ahead finish one by one until yours is next
 *   1  your turn (banner turns blue)
 *   2  switch to upload page; cursor drags the tar icon onto the drop zone; files list in
 *   3  build checks run one by one → "พร้อมบิน"
 *   4  overlay with the real dashboard media (image now, video later)
 * ════════════════════════════════════════════════════════════════════════════════ */

// ── Layout (stage px) ──
/** Where the tar icon rests (bottom of the sidebar, "ไฟล์ในเครื่อง"). */
const TAR_START = { x: 96, y: 500 };
/** Centre of the drop zone: main pane 190 + padding 30 + left 40 + 340/2, top 22 + 78 + 160/2. */
const DROP = { x: 430, y: 182 };
/** The cursor holds the icon a little below-right of its centre. */
const GRIP = { x: 20, y: 30 };

// ── Timing (ms) ──
const T = {
  teamDone: 1500, // each team ahead finishes
  dragGlide: 900, // tar icon flight (matches .tar transition in step-queue.scss)
  fileEvery: 180, // tar files list in
  check: 650, // each build check
  dockerBuild: 1100, // the 3rd check (docker build) takes longer
};

@Component({
  selector: 'dw-step-queue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DwCursor, DwMediaSlot, DwDashboardNav, DwQueueBoard, DwTarUpload],
  templateUrl: './step-queue.html',
  styleUrl: './step-queue.scss',
})
export class DwStepQueue extends DwStepBase {
  readonly content = input<QueueContent>(DW_DEFAULT_CONTENT.queue);

  // ── State read by the template / parts ──
  protected readonly page = signal<'queue' | 'upload'>('queue');
  protected readonly served = signal(0);
  protected readonly tar = signal<{ x: number; y: number; state: 'rest' | 'drag' | 'dropped' }>({ ...TAR_START, state: 'rest' });
  protected readonly hover = signal(false);
  protected readonly filesShown = signal(0);
  protected readonly checks = signal<BuildCheckState[]>([]);
  protected readonly ready = signal(false);
  protected readonly showMedia = signal(false);
  protected readonly cursor = signal<CursorState>(hiddenCursor());

  /** Index of your team in content.queue.queue. */
  private readonly youIndex = computed(() => Math.max(0, this.content().queue.findIndex((q) => q.you)));

  protected settle(n: number): void {
    const you = this.youIndex();
    this.page.set(n >= 2 ? 'upload' : 'queue');
    this.served.set(n >= 2 ? you : n >= 1 ? Math.max(0, you - 1) : 0);
    this.tar.set(n >= 3 ? { ...DROP, state: 'dropped' } : { ...TAR_START, state: 'rest' });
    this.hover.set(false);
    this.filesShown.set(n >= 3 ? this.content().tarFiles.length : 0);
    this.checks.set(this.content().buildChecks.map(() => (n >= 4 ? 'ok' : 'idle')));
    this.ready.set(n >= 4);
    this.showMedia.set(n >= 5);
    this.cursor.set(hiddenCursor());
  }

  protected animate(beat: number): void {
    const you = this.youIndex();
    this.seq.run(async (s) => {
      switch (beat) {
        // ── beat 0 · wait in the queue ──
        case 0: {
          for (let k = 1; k <= Math.max(0, you - 1); k++) {
            await s.wait(T.teamDone);
            this.served.set(k);
          }
          break;
        }
        // ── beat 1 · your turn ──
        case 1: {
          await s.wait(500);
          this.served.set(you);
          break;
        }
        // ── beat 2 · drag the tar onto the dashboard ──
        case 2: {
          this.page.set('upload');
          await s.wait(500);
          // grab
          this.cursor.set({ x: TAR_START.x + GRIP.x, y: TAR_START.y + GRIP.y, show: true, click: false });
          await s.wait(700);
          this.cursor.update((c) => ({ ...c, click: true }));
          this.tar.set({ ...TAR_START, state: 'drag' });
          await s.wait(200);
          // fly icon + cursor together
          this.tar.set({ ...DROP, state: 'drag' });
          this.cursor.set({ x: DROP.x + GRIP.x, y: DROP.y + GRIP.y, show: true, click: true });
          await s.wait(T.dragGlide / 2);
          this.hover.set(true);
          await s.wait(T.dragGlide / 2);
          // drop
          this.cursor.update((c) => ({ ...c, click: false }));
          this.tar.set({ ...DROP, state: 'dropped' });
          this.hover.set(false);
          await s.wait(200);
          this.cursor.update((c) => ({ ...c, show: false }));
          for (let i = 1; i <= this.content().tarFiles.length; i++) {
            await s.wait(T.fileEvery);
            this.filesShown.set(i);
          }
          break;
        }
        // ── beat 3 · checks and build ──
        case 3: {
          const list: BuildCheckState[] = this.content().buildChecks.map(() => 'idle');
          for (let i = 0; i < list.length; i++) {
            list[i] = 'run';
            this.checks.set([...list]);
            await s.wait(i === 2 ? T.dockerBuild : T.check);
            list[i] = 'ok';
            this.checks.set([...list]);
          }
          await s.wait(200);
          this.ready.set(true);
          break;
        }
        // ── beat 4 · real dashboard media ──
        case 4: {
          await s.wait(150);
          this.showMedia.set(true);
          break;
        }
      }
    });
  }
}
