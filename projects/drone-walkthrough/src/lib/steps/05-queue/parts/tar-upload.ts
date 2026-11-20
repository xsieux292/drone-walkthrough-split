import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TarFile } from '../../../models';
import { DwTarContents } from '../../../shared/tar-contents';

export type BuildCheckState = 'idle' | 'run' | 'ok';

/**
 * PART · 3.3.5 · The upload page: drop zone → list of files inside the tar → checks/build card.
 *
 * Purely visual:
 *   hover       drop zone highlighted (file is over it)
 *   filesShown  how many tar files are listed (0 = drop zone still visible)
 *   checks      state per build check (same order as content.queue.buildChecks)
 *   ready       green "พร้อมบิน" line
 * The file list is the manual's "ไฟล์ใน tar ของคุณ" diagram (shared/tar-contents.ts), rows slide in.
 * The drop zone centre is DROP in step-queue.ts.
 */
@Component({
  selector: 'dw-tar-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DwTarContents],
  templateUrl: './tar-upload.html',
  styleUrl: './tar-upload.scss',
})
export class DwTarUpload {
  readonly teamName = input('');
  readonly tarName = input('');
  readonly tarFiles = input<TarFile[]>([]);
  readonly tarRules = input<string[]>([]);
  readonly buildChecks = input<string[]>([]);
  readonly hover = input(false);
  readonly filesShown = input(0);
  readonly checks = input<BuildCheckState[]>([]);
  readonly ready = input(false);

  protected readonly checkPct = computed(() => {
    const c = this.checks();
    return c.length ? (c.filter((x) => x === 'ok').length / c.length) * 100 : 0;
  });
}
