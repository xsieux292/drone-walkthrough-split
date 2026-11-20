import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DW_CONFIG, resolveAsset } from '../../../config';
import { ResultFile } from '../../../models';

/**
 * PART · 3.3.6 · Grid of files the team receives after the flight.
 * `shown` = how many cards are visible (they pop in one by one).
 * A file without `href` gets a grey, disabled download button.
 */
@Component({
  selector: 'dw-result-files',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h4>ไฟล์ที่ทีมได้รับ</h4>
    <div class="grid">
      @for (f of files(); track f.name; let i = $index) {
        <div class="file" [class.in]="i < shown()">
          <span class="ext">{{ f.name.split('.').pop() }}</span>
          <div><b>{{ f.name }}</b><small>{{ f.description }}</small></div>
          @if (f.href) {
            <a class="dl" [href]="url(f.href)" download tabindex="-1" aria-label="ดาวน์โหลด">⤓</a>
          } @else {
            <span class="dl off" title="ยังไม่มีไฟล์">⤓</span>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    h4 { margin: 0 0 10px; font-size: 18px; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .file { display: grid; grid-template-columns: 52px 1fr 36px; align-items: center; gap: 12px; padding: 10px 12px;
      border-radius: 12px; background: #fff; border: 1px solid var(--dw-line);
      opacity: 0; transform: translateY(10px); transition: all .35s; }
    .file.in { opacity: 1; transform: none; }
    .ext { height: 40px; display: grid; place-items: center; border-radius: 8px; background: var(--dw-accent-soft); color: var(--dw-accent);
      font: 800 11px var(--dw-mono); text-transform: uppercase; }
    b { display: block; font-family: var(--dw-mono); font-size: 13.5px; }
    small { color: var(--dw-muted); font-size: 12px; }
    .dl { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 8px; background: var(--dw-accent); color: #fff;
      text-decoration: none; font-weight: 700; }
    .dl.off { background: #e6ebf3; color: #9aa6ba; cursor: not-allowed; }
  `,
})
export class DwResultFiles {
  readonly files = input<ResultFile[]>([]);
  readonly shown = input(0);

  private readonly base = inject(DW_CONFIG).assetBase;
  protected url(h: string): string {
    return resolveAsset(this.base, h);
  }
}
