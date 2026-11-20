import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * PART · 3.3.2 · Terminal panel that slides up from the bottom of the browser body,
 * types the download command and shows a progress bar for the dataset zip.
 *
 * Purely visual: `typed` (characters shown) and `progress` (0..1) come from the step.
 */
@Component({
  selector: 'dw-download-terminal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.on]': 'open()' },
  template: `
    <div class="bar">terminal</div>
    <!-- command being typed; caret blinks until the download starts -->
    <pre><span class="p">$</span> {{ shown() }}@if (progress() === 0) {<span class="caret"></span>}</pre>
    @if (progress() > 0) {
      <div class="dl">
        <span>{{ fileName() }}</span>
        <div class="track"><i [style.width.%]="progress() * 100"></i></div>
        <span class="pct">{{ (progress() * 100).toFixed(0) }}%</span>
      </div>
      @if (progress() >= 1) { <div class="ok">✓ saved to data/</div> }
    }
  `,
  styles: `
    @keyframes dw-blink { 50% { opacity: 0; } }
    /* closed: parked below the browser body; .on slides it up */
    :host { position: absolute; left: 22px; right: 22px; bottom: 14px; height: 150px; display: block;
      border-radius: 10px; background: #020409; border: 1px solid #1f2937; font: 12.5px var(--dw-mono); color: #e5e7eb;
      transform: translateY(190px); transition: transform .5s cubic-bezier(.2,.8,.2,1); }
    :host(.on) { transform: none; }
    .bar { padding: 5px 14px; border-bottom: 1px solid #1f2937; color: #6b7280; font-size: 11px; }
    pre { margin: 10px 14px 8px; white-space: pre-wrap; }
    .p { color: #22c55e; }
    .caret { display: inline-block; width: 7px; height: 14px; margin-left: 2px; vertical-align: -2px; background: #e5e7eb; animation: dw-blink 1s steps(1) infinite; }
    .dl { display: grid; grid-template-columns: auto 1fr 44px; align-items: center; gap: 12px; margin: 0 14px; color: #9ca3af; }
    .track { height: 6px; border-radius: 3px; background: #1f2937; overflow: hidden; }
    .track i { display: block; height: 100%; background: linear-gradient(90deg, #fbbf24, #f59e0b); }
    .pct { text-align: right; color: #e5e7eb; }
    .ok { margin: 6px 14px; color: #22c55e; }
  `,
})
export class DwDownloadTerminal {
  readonly open = input(false);
  readonly command = input('');
  readonly typed = input(0);
  readonly progress = input(0);
  readonly fileName = input('');

  protected readonly shown = computed(() => this.command().slice(0, this.typed()));
}
