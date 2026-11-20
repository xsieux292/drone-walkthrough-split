import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';

/**
 * A fixed design canvas (default 960×600) scaled to the available width. Step animations are laid out in
 * design pixels, so they look the same on a phone and on a projector.
 */
@Component({
  selector: 'dw-stage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="frame" [style.height.px]="height() * scale()">
      <div class="canvas" [style.width.px]="width()" [style.height.px]="height()" [style.transform]="'scale(' + scale() + ')'">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    :host { display: block; width: 100%; }
    .frame { position: relative; width: 100%; overflow: hidden; border-radius: var(--dw-radius-lg, 18px); }
    .canvas { position: absolute; top: 0; left: 0; transform-origin: 0 0; }
  `,
})
export class DwStage {
  readonly width = input(960);
  readonly height = input(600);
  protected readonly scale = signal(1);

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const update = () => this.scale.set(Math.max(0.2, el.clientWidth / this.width()));
      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      destroyRef.onDestroy(() => ro.disconnect());
    });
  }
}
