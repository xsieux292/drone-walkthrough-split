import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { DW_DEFAULT_CONTENT } from '../../content.default';
import { RouteContent } from '../../models';
import { DwCursor } from '../../shared/cursor';
import { CursorState, hiddenCursor, moveAndClick, placeCursor } from '../../util/cursor-script';
import { DwStepBase } from '../step-base';
import { DwPlannerMap } from './parts/planner-map';
import { DwPlannerSide, PlanCheck, PlanItem, PlanStatus } from './parts/planner-side';
import { MAP_SCALE, ORBIT, Pt, ROUTE, SAVE_BUTTON, TOOL, toStage, toolAt } from './route-geometry';

/* ════════════════════════════════════════════════════════════════════════════════
 * STEP 3.3.4 · วางแผนการบิน (mock of our Route Planner)
 *
 * This file = the TIMELINE only.
 * Visual pieces:
 *   step-route.html / .scss   header bar + where the map / side panel / KML toast sit
 *   parts/planner-map.*       satellite map, rules, drawn route + orbit, toolbar, legend
 *   parts/planner-side.*      time bar, status, items list, rule checks
 *   route-geometry.ts         every coordinate (map shapes, toolbar, save button)
 *
 * Beats (labels + durations: content.default.ts → steps[3].beats):
 *   0  click the "เส้นตรง" tool
 *   1  click the ROUTE points one by one (rubber band follows)
 *   2  pick "วงกลม", click the hall, drag out the radius
 *   3  rule checks run one by one → "ผ่านทุกข้อ"
 *   4  click "บันทึก" → mission.kml card
 * ════════════════════════════════════════════════════════════════════════════════ */

// ── Text shown in the side panel ──
const ITEM_ROUTE: PlanItem = { n: 1, name: 'route A', kind: 'เส้นตรง', time: '96 s' };
const ITEM_ORBIT: PlanItem = { n: 2, name: 'orbit hall', kind: 'วงกลม', time: '177 s' };
const CHECKS = ['อยู่ในขอบสนาม', 'ไม่เข้าเขตห้ามบิน', 'สูงกว่าความสูงปลอดภัย', 'เวลารวมไม่เกินกำหนด'];
/** Flight time (s) shown after each stage: route, + orbit, final after checks. Illustrative. */
const TIME = { route: 96, orbit: 273, final: 612 };

// ── Timing (ms) ──
const T = {
  pointGlide: 560, // cursor glide between route points
  radiusDrag: 700, // orbit radius grows
  checkEach: 420, // per rule check
  timeBar: 500, // time bar update
};

@Component({
  selector: 'dw-step-route',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DwCursor, DwPlannerMap, DwPlannerSide],
  templateUrl: './step-route.html',
  styleUrl: './step-route.scss',
})
export class DwStepRoute extends DwStepBase {
  readonly content = input<RouteContent>(DW_DEFAULT_CONTENT.route);

  // ── State read by the template / parts ──
  protected readonly tool = signal<number>(TOOL.select);
  protected readonly points = signal(0);
  protected readonly ghost = signal<Pt | null>(null);
  protected readonly orbitR = signal(0);
  protected readonly items = signal<PlanItem[]>([]);
  protected readonly checks = signal<PlanCheck[]>([]);
  protected readonly timeUsed = signal(0);
  protected readonly status = signal<PlanStatus>('draft');
  protected readonly saved = signal(false);
  protected readonly cursor = signal<CursorState>(hiddenCursor());

  protected settle(n: number): void {
    this.tool.set(n >= 3 ? TOOL.circle : n >= 1 ? TOOL.line : TOOL.select);
    this.points.set(n >= 2 ? ROUTE.length : 0);
    this.ghost.set(null);
    this.orbitR.set(n >= 3 ? ORBIT.r : 0);
    this.items.set(n >= 3 ? [ITEM_ROUTE, ITEM_ORBIT] : n >= 2 ? [ITEM_ROUTE] : []);
    this.checks.set(CHECKS.map((label) => ({ label, state: n >= 4 ? 'ok' : 'idle' })));
    this.timeUsed.set(n >= 4 ? TIME.final : n >= 3 ? TIME.orbit : n >= 2 ? TIME.route : 0);
    this.status.set(n >= 4 ? 'ok' : 'draft');
    this.saved.set(n >= 5);
    this.cursor.set(hiddenCursor());
  }

  protected animate(beat: number): void {
    this.seq.run(async (s) => {
      /** Count the time bar from `from` to `to`. */
      const timeTo = (from: number, to: number) => s.tween(T.timeBar, (t) => this.timeUsed.set(Math.round(from + (to - from) * t)));

      switch (beat) {
        // ── beat 0 · pick the line tool ──
        case 0: {
          placeCursor(this.cursor, { x: 420, y: 320 });
          await s.wait(500);
          await moveAndClick(s, this.cursor, toolAt(TOOL.line), 800);
          this.tool.set(TOOL.line);
          break;
        }
        // ── beat 1 · click the route points ──
        case 1: {
          placeCursor(this.cursor, toolAt(TOOL.line));
          for (let i = 0; i < ROUTE.length; i++) {
            await moveAndClick(s, this.cursor, toStage(ROUTE[i]), i ? T.pointGlide : 700);
            this.points.set(i + 1);
            this.ghost.set(ROUTE[i + 1] ?? null); // rubber band towards the next point
          }
          this.ghost.set(null);
          this.items.set([ITEM_ROUTE]);
          await timeTo(0, TIME.route);
          break;
        }
        // ── beat 2 · orbit around the hall ──
        case 2: {
          placeCursor(this.cursor, toStage(ROUTE[ROUTE.length - 1]));
          await moveAndClick(s, this.cursor, toolAt(TOOL.circle), 600);
          this.tool.set(TOOL.circle);
          const c = toStage(ORBIT);
          await moveAndClick(s, this.cursor, c, 650);
          // press and drag out the radius
          this.cursor.set({ x: c.x + ORBIT.r * MAP_SCALE, y: c.y, show: true, click: true });
          await s.tween(T.radiusDrag, (t) => this.orbitR.set(ORBIT.r * t));
          this.cursor.update((v) => ({ ...v, click: false }));
          this.items.set([ITEM_ROUTE, ITEM_ORBIT]);
          await timeTo(TIME.route, TIME.orbit);
          break;
        }
        // ── beat 3 · rule checks ──
        case 3: {
          this.cursor.update((v) => ({ ...v, show: false }));
          this.status.set('checking');
          const list: PlanCheck[] = CHECKS.map((label) => ({ label, state: 'idle' }));
          for (let i = 0; i < list.length; i++) {
            list[i] = { ...list[i], state: 'run' };
            this.checks.set([...list]);
            await s.wait(T.checkEach);
            list[i] = { ...list[i], state: 'ok' };
            this.checks.set([...list]);
          }
          await timeTo(TIME.orbit, TIME.final);
          this.status.set('ok');
          break;
        }
        // ── beat 4 · save → mission.kml ──
        case 4: {
          placeCursor(this.cursor, { x: 600, y: 300 });
          await s.wait(100);
          await moveAndClick(s, this.cursor, SAVE_BUTTON, 800);
          this.saved.set(true);
          break;
        }
      }
    });
  }
}
