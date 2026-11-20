import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * PART · 3.3.5 · Dark left sidebar of the mock dashboard: brand, team card, menu.
 * `page` highlights the menu item ('queue' | 'upload'). The bottom strip ("ไฟล์ในเครื่อง") is where the
 * tar icon starts before it is dragged (TAR_START in step-queue.ts).
 */
@Component({
  selector: 'dw-dashboard-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="brand"><span class="b-ico">◆</span> Dashboard</div>
    <div class="team-card">
      <span class="avatar">{{ teamName().slice(-2) }}</span>
      <div><b>{{ teamName() }}</b><small>ทีมของคุณ</small></div>
    </div>
    <!-- menu (edit items here) -->
    <nav>
      <span>ภาพรวม</span>
      <span [class.on]="page() === 'queue'">คิวบิน</span>
      <span [class.on]="page() === 'upload'">ส่งงาน</span>
      <span>ผลคะแนน</span>
    </nav>
    <div class="desk">ไฟล์ในเครื่อง</div>
  `,
  styles: `
    :host { position: absolute; left: 0; top: 0; bottom: 0; width: 190px; padding: 18px 14px; box-sizing: border-box; display: block;
      background: #0f1b33; color: #c9d3e6; font-size: 13px; }
    .brand { font-weight: 700; color: #fff; font-size: 15px; }
    .b-ico { color: var(--dw-accent-2); }
    .team-card { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding: 10px; border-radius: 10px; background: rgba(255,255,255,.06); }
    .avatar { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px;
      background: linear-gradient(135deg, var(--dw-accent), var(--dw-accent-2)); color: #fff; font-weight: 700; }
    .team-card b { display: block; color: #fff; }
    .team-card small { font-size: 11px; color: #8ea0c2; }
    nav { display: grid; gap: 4px; margin-top: 18px; }
    nav span { padding: 8px 10px; border-radius: 8px; transition: background .3s, color .3s; }
    nav span.on { background: var(--dw-accent); color: #fff; }
    .desk { position: absolute; left: 14px; right: 14px; bottom: 16px; padding-top: 10px; border-top: 1px dashed #34446a; font-size: 11px; color: #8ea0c2; }
  `,
})
export class DwDashboardNav {
  readonly teamName = input('');
  readonly page = input<'queue' | 'upload'>('queue');
}
