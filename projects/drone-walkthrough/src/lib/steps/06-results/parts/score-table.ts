import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ScoreRow } from '../../../models';

/**
 * PART · 3.3.6 · Score table card.
 *
 * Purely visual. `count` (0..1) makes the numbers count up from 0.
 * A row with value null shows an empty cell; if any row is null the total is empty too.
 * `sample` shows the dashed "ตัวอย่าง" stamp (content.results.scoresAreSample).
 */
@Component({
  selector: 'dw-score-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <h4>ตารางคะแนน</h4>
      @if (sample()) { <span class="sample">ตัวอย่าง · ยังไม่ใช่คะแนนจริง</span> }
    </header>
    <table>
      <thead><tr><th>หัวข้อ</th><th class="num">คะแนน</th><th class="num">เต็ม</th></tr></thead>
      <tbody>
        @for (r of scores(); track r.label) {
          <tr>
            <td><b>{{ r.label }}</b>@if (r.note) { <small>{{ r.note }}</small> }</td>
            <td class="num val">{{ show(r.value) }}</td>
            <td class="num max">{{ r.max ?? '' }}</td>
          </tr>
        }
      </tbody>
      <tfoot>
        <tr><td>รวม</td><td class="num">{{ show(total()) }}</td><td class="num">{{ totalMax() ?? '' }}</td></tr>
      </tfoot>
    </table>
  `,
  styles: `
    :host { display: block; padding: 18px 20px; border-radius: 16px; background: #fff; border: 1px solid var(--dw-line);
      box-shadow: 0 20px 40px -24px rgba(9,20,45,.4); }
    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    h4 { margin: 0; font-size: 20px; }
    .sample { padding: 3px 10px; border-radius: 6px; border: 1.5px dashed var(--dw-todo); color: var(--dw-todo-ink);
      font-size: 11.5px; font-weight: 700; transform: rotate(-2deg); }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { padding: 8px 4px; border-bottom: 1px solid var(--dw-line); color: var(--dw-muted); font-weight: 500; text-align: left; font-size: 12.5px; }
    td { padding: 10px 4px; border-bottom: 1px solid var(--dw-line); vertical-align: top; }
    td b { display: block; }
    td small { color: var(--dw-muted); font-size: 12px; }
    .num { width: 70px; text-align: right; font-family: var(--dw-mono); }
    .val { font-size: 18px; font-weight: 700; color: var(--dw-accent); }
    .max { color: var(--dw-muted); }
    tfoot td { border: 0; padding-top: 12px; font-size: 16px; font-weight: 700; }
    tfoot .num:nth-child(2) { font-size: 26px; color: var(--dw-fg); }
  `,
})
export class DwScoreTable {
  readonly scores = input<ScoreRow[]>([]);
  readonly sample = input(false);
  /** 0..1 count-up factor. */
  readonly count = input(1);

  protected readonly total = computed(() => {
    const rows = this.scores();
    return rows.some((r) => r.value === null) ? null : rows.reduce((s, r) => s + (r.value ?? 0), 0);
  });
  protected readonly totalMax = computed(() => {
    const rows = this.scores().filter((r) => r.max !== null);
    return rows.length ? rows.reduce((s, r) => s + (r.max ?? 0), 0) : null;
  });

  /** Number shown in a cell: counted up, integers stay integers, null stays empty. */
  protected show(v: number | null): string {
    if (v === null) return '';
    const x = v * this.count();
    return Number.isInteger(v) ? Math.round(x).toString() : x.toFixed(1);
  }
}
