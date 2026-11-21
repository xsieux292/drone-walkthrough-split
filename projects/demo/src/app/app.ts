import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DW_DEFAULT_CONTENT, DwWalkthrough, StepChangeEvent, WalkthroughMode } from 'drone-walkthrough';

/**
 * Demo host: a fake site header (to show how the walkthrough sits inside a page) plus a mode switch.
 * Default = carousel (steps slide left, one step tall). ?mode=scroll or ?mode=slides opens the other modes.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DwWalkthrough],
  template: `
    <header class="site">
      <span class="logo">NT DRONE <small>demo host</small></span>
      <div class="switch" role="group" aria-label="โหมด">
        <button type="button" [class.on]="mode() === 'carousel'" (click)="setMode('carousel')">เลื่อนซ้าย</button>
        <button type="button" [class.on]="mode() === 'scroll'" (click)="setMode('scroll')">เลื่อนลง</button>
        <button type="button" [class.on]="mode() === 'slides'" (click)="setMode('slides')">สไลด์</button>
      </div>
    </header>

    <dw-walkthrough [content]="content" [mode]="mode()" (stepChange)="last.set($event)" />

    @if (mode() !== 'slides') {
      <footer class="site-foot">ส่วนท้ายของเว็บหลัก · ขั้นล่าสุด: {{ last()?.stepId }} / beat {{ last()?.beat }}</footer>
    }
  `,
  styles: `
    :host { display: block; --dw-rail-top: 56px; }
    .site { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between;
      height: 56px; padding: 0 20px; background: #fff; border-bottom: 1px solid #e2e8f2; font-family: 'IBM Plex Sans Thai', sans-serif; }
    .logo { font-weight: 800; color: #1f5eff; letter-spacing: .04em; small { margin-left: 8px; color: #8a97ad; font-weight: 500; letter-spacing: 0; } }
    .switch { display: flex; padding: 3px; border-radius: 999px; background: #eef2f8; }
    .switch button { border: 0; padding: 6px 14px; border-radius: 999px; background: transparent; font: inherit; font-size: 13px; cursor: pointer; color: #5b6b84; }
    .switch .on { background: #fff; color: #0f1b33; box-shadow: 0 1px 4px rgba(0,0,0,.12); }
    .site-foot { padding: 40px 20px; text-align: center; color: #8a97ad; font-family: 'IBM Plex Sans Thai', sans-serif; background: #fff; border-top: 1px solid #e2e8f2; }
    dw-walkthrough.mode-slides { --dw-slides-height: calc(100vh - 56px); }
    .switch button { white-space: nowrap; }
    @media (max-width: 520px) {
      .site { padding: 0 12px; }
      .logo small { display: none; }
      .switch button { padding: 6px 10px; }
    }
  `,
})
export class App {
  protected readonly content = DW_DEFAULT_CONTENT;
  protected readonly mode = signal<WalkthroughMode>(modeFromUrl());
  protected readonly last = signal<StepChangeEvent | null>(null);

  protected setMode(m: WalkthroughMode): void {
    this.mode.set(m);
    window.scrollTo({ top: 0 });
  }
}

/** ?mode=scroll | slides | carousel (default carousel). */
function modeFromUrl(): WalkthroughMode {
  const m = new URLSearchParams(location.search).get('mode');
  return m === 'scroll' || m === 'slides' ? m : 'carousel';
}
