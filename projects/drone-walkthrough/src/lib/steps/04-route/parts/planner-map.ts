import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DwAssetPipe } from '../../../config';
import { MediaSource } from '../../../models';
import * as G from '../route-geometry';

/**
 * PART · 3.3.4 · The map pane of the mock Route Planner: satellite image, safe-height tint,
 * field boundary, no-fly / landing / pad, the drawn route + orbit, labels, toolbar and legend.
 *
 * Purely visual. The step sets:
 *   tool    which toolbar button is highlighted (index into G.TOOLS)
 *   points  how many ROUTE points are placed
 *   ghost   rubber-band end point while drawing (map px) or null
 *   orbitR  current orbit radius (0 = not drawn)
 * Geometry is in ../route-geometry.ts (shared with the step's cursor targets).
 */
@Component({
  selector: 'dw-planner-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DwAssetPipe],
  templateUrl: './planner-map.html',
  styleUrl: './planner-map.scss',
})
export class DwPlannerMap {
  readonly map = input<MediaSource | null>(null);
  readonly attribution = input('');
  readonly tool = input(0);
  readonly points = input(0);
  readonly ghost = input<G.Pt | null>(null);
  readonly orbitR = input(0);

  protected readonly G = G;

  protected readonly placed = computed(() => G.ROUTE.slice(0, this.points()));
  /** Route polyline, plus the rubber band to `ghost` while drawing. */
  protected readonly routePath = computed(() => {
    const pts = [...this.placed()];
    const g = this.ghost();
    if (g && pts.length) pts.push(g);
    return pts.map((p, i) => (i ? 'L' : 'M') + p.x + ' ' + p.y).join(' ');
  });
  protected readonly routeDone = computed(() => this.points() > 1 && !this.ghost());
  protected readonly orbitDone = computed(() => this.orbitR() >= G.ORBIT.r);
}
