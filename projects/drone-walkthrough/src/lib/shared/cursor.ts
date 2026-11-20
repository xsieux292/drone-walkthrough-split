import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A fake mouse pointer positioned in stage pixels. Move it by changing x/y (CSS transition does the
 * glide); toggle `clicking` for the press ripple.
 */
@Component({
  selector: 'dw-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.transform]': "'translate(' + x() + 'px,' + y() + 'px)'",
    '[style.transition-duration.ms]': 'glideMs()',
    '[class.visible]': 'visible()',
    '[class.clicking]': 'clicking()',
    'aria-hidden': 'true',
  },
  template: `
    <span class="ripple"></span>
    <svg viewBox="0 0 24 24"><path d="M5 3l14 8-6 1.6L10 19z" fill="#0f1b33" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" /></svg>
  `,
  styles: `
    :host { position: absolute; top: 0; left: 0; z-index: 20; width: 26px; height: 26px; pointer-events: none;
      opacity: 0; transition-property: transform, opacity; transition-timing-function: cubic-bezier(.45,.05,.25,1); }
    :host(.visible) { opacity: 1; }
    svg { position: absolute; top: -3px; left: -5px; width: 26px; height: 26px; filter: drop-shadow(0 2px 3px rgba(0,0,0,.35)); transition: transform .12s; }
    :host(.clicking) svg { transform: scale(.85); }
    .ripple { position: absolute; top: -18px; left: -18px; width: 36px; height: 36px; border-radius: 50%;
      border: 2px solid var(--dw-accent, #1f5eff); opacity: 0; transform: scale(.3); }
    :host(.clicking) .ripple { animation: dw-ripple .5s ease-out; }
    @keyframes dw-ripple { from { opacity: .9; transform: scale(.3); } to { opacity: 0; transform: scale(1.4); } }
  `,
})
export class DwCursor {
  readonly x = input(0);
  readonly y = input(0);
  readonly visible = input(true);
  readonly clicking = input(false);
  readonly glideMs = input(700);
}
