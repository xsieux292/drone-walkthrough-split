import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Minimal browser window chrome around projected content. */
@Component({
  selector: 'dw-browser-frame',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar" [class.dark]="dark()">
      <span class="dots"><i></i><i></i><i></i></span>
      <span class="url"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7V5a3 3 0 0 1 6 0v2M4 7h8v6H4z" fill="none" stroke="currentColor" stroke-width="1.3" /></svg>{{ url() }}</span>
    </div>
    <div class="body"><ng-content /></div>
  `,
  styles: `
    :host { display: flex; flex-direction: column; overflow: hidden; border-radius: 12px; background: #fff;
      box-shadow: 0 24px 60px -18px rgba(15, 27, 51, 0.35), 0 0 0 1px rgba(15, 27, 51, 0.08); }
    .bar { display: flex; align-items: center; gap: 14px; height: 36px; padding: 0 14px; background: #eef2f8; flex: none; }
    .bar.dark { background: #1b2232; color: #c9d3e6; }
    .dots { display: flex; gap: 6px; }
    .dots i { width: 10px; height: 10px; border-radius: 50%; background: #ff5f57; }
    .dots i:nth-child(2) { background: #febc2e; }
    .dots i:nth-child(3) { background: #28c840; }
    .url { display: flex; align-items: center; gap: 6px; flex: 1; max-width: 460px; height: 22px; padding: 0 10px; border-radius: 6px;
      background: rgba(255, 255, 255, 0.75); font: 12px/22px var(--dw-mono, ui-monospace, monospace); color: #45536b; overflow: hidden; white-space: nowrap; }
    .bar.dark .url { background: #0f1420; color: #9fb0cc; }
    .url svg { width: 12px; height: 12px; flex: none; }
    .body { position: relative; flex: 1; min-height: 0; }
  `,
})
export class DwBrowserFrame {
  readonly url = input('');
  readonly dark = input(false);
}
