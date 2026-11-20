import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TarFile } from '../models';
import { richText } from '../util/rich-text';

/**
 * SHARED PART · "ไฟล์ใน tar ของคุณ" diagram, redrawn in HTML from
 * competition_base_demo/manual/manual.tex (the TikZ figure in section "ไฟล์ใน tar ของคุณ (5 ไฟล์หลัก)").
 *
 *   ┌ team07.tar ─────────────────────────────────────┐
 *   │ [ Dockerfile        ]  ใช้ตามตัวอย่าง ไม่ต้องแก้    │   box colour = TarFile.emphasis
 *   │ [ requirements.txt  ]  ไลบรารีของโมเดลที่คุณใช้     │
 *   │ …                                               │
 *   └─────────────────────────────────────────────────┘
 *   • rules (content.queue.tarRules)
 *
 * Inputs: `shown` rows are visible (they slide in as it grows); `compact` = smaller type for tight spots.
 * Notes and rules accept **bold** and `code` (util/rich-text.ts).
 */
@Component({
  selector: 'dw-tar-contents',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.compact]': 'compact()' },
  template: `
    <div class="box">
      <div class="title">{{ tarName() }}</div>
      @for (f of rows(); track f.name; let i = $index) {
        <div class="row" [class.in]="i < shown()">
          <span [class]="'file e-' + (f.emphasis ?? 'lib')">{{ f.name }}</span>
          <span class="note">@for (seg of f.segs; track $index) {@if (seg.code) {<code>{{ seg.text }}</code>} @else if (seg.bold) {<b>{{ seg.text }}</b>} @else {<span>{{ seg.text }}</span>}}</span>
        </div>
      }
    </div>
    @if (showRules() && ruleRows().length) {
      <ul class="rules" [class.in]="shown() >= files().length">
        @for (r of ruleRows(); track $index) {
          <li>@for (seg of r; track $index) {@if (seg.code) {<code>{{ seg.text }}</code>} @else if (seg.bold) {<b>{{ seg.text }}</b>} @else {<span>{{ seg.text }}</span>}}</li>
        }
      </ul>
    }
  `,
  styleUrl: './tar-contents.scss',
})
export class DwTarContents {
  readonly tarName = input('team07.tar');
  readonly files = input<TarFile[]>([]);
  readonly rules = input<string[]>([]);
  /** How many rows are visible. Default: all. */
  readonly shown = input(99);
  readonly compact = input(false);
  readonly showRules = input(true);

  protected readonly rows = computed(() => this.files().map((f) => ({ ...f, segs: richText(f.note) })));
  protected readonly ruleRows = computed(() => this.rules().map(richText));
}
