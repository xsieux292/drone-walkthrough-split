import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DwAssetPipe } from '../../../config';
import { TrainContent } from '../../../models';

/**
 * PART · 3.3.3 · Training scene: dataset images on a conveyor → RF-DETR block → preview with boxes,
 * epoch counter, loss and mAP mini charts, and the weights file card.
 *
 * Purely visual. Everything follows one number, `progress` (0..1 of the training run):
 *   epoch        = progress × epochs
 *   preview      cycles through the dataset images (10 changes per run)
 *   predicted box = ground-truth box + noise that shrinks to 0 at the end
 *   confidence   rises from 0.18 to 0.94
 *   loss / mAP   drawn up to `progress` (illustrative curves below — swap for real numbers if you have them)
 * `feeding` turns on the conveyor + pulsing layers; `weights` shows the final file card.
 */

// ── Illustrative curves, value 0..1 at run fraction p. Replace with real history if available. ──
const lossAt = (p: number) => 0.12 + 0.88 * Math.exp(-4.2 * p) + 0.03 * Math.sin(p * 40) * (1 - p);
const mapAt = (p: number) => 0.92 * (1 - Math.exp(-3.6 * p)) + 0.015 * Math.sin(p * 31) * (1 - p);

/** Preview image size in design px (16:9 like the 1280×720 renders). */
const PREVIEW = { w: 400, h: 225 };
/** Mini chart size in design px. */
const CHART = { w: 180, h: 56 };
/** How many times the preview image changes during one run. */
const PREVIEW_CHANGES = 10;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** SVG path of fn from 0 to upTo, scaled to w×h (value 1 = top). */
function curvePath(fn: (p: number) => number, upTo: number): string {
  const n = Math.max(2, Math.round(60 * upTo));
  let d = '';
  for (let i = 0; i <= n; i++) {
    const p = (i / n) * upTo;
    const v = Math.max(0, Math.min(1, fn(p)));
    d += (i ? 'L' : 'M') + (p * CHART.w).toFixed(1) + ' ' + ((1 - v) * CHART.h).toFixed(1);
  }
  return d;
}

/** YOLO (cx, cy, w, h normalised) → preview pixels. */
function toBox(cx: number, cy: number, w: number, h: number): Box {
  return { x: (cx - w / 2) * PREVIEW.w, y: (cy - h / 2) * PREVIEW.h, w: w * PREVIEW.w, h: h * PREVIEW.h };
}

@Component({
  selector: 'dw-train-viz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DwAssetPipe],
  templateUrl: './train-viz.html',
  styleUrl: './train-viz.scss',
  host: { '[class.feeding]': 'feeding()' },
})
export class DwTrainViz {
  readonly train = input.required<TrainContent>();
  /** 0..1 of the training run. */
  readonly progress = input(0);
  /** Images flowing + model layers pulsing. */
  readonly feeding = input(false);
  /** Show the finished weights card. */
  readonly weights = input(false);

  protected readonly PREVIEW = PREVIEW;
  protected readonly CHART = CHART;

  protected readonly epoch = computed(() => (this.progress() > 0 ? Math.max(1, Math.round(this.progress() * this.train().epochs)) : 0));
  protected readonly previewIndex = computed(() => {
    const n = this.train().images.length;
    return n ? Math.floor(this.progress() * (PREVIEW_CHANGES - 0.001)) % n : 0;
  });
  protected readonly preview = computed(() => this.train().images[this.previewIndex()]);
  protected readonly confidence = computed(() => 0.18 + 0.76 * Math.pow(this.progress(), 0.7));
  protected readonly gtBoxes = computed<Box[]>(() => (this.preview()?.boxes ?? []).map(([cx, cy, w, h]) => toBox(cx, cy, w, h)));
  protected readonly predBoxes = computed<Box[]>(() => {
    const img = this.preview();
    if (!img) return [];
    const noise = (1 - this.progress()) * 0.22; // how far off the guess is; 0 at the end
    return img.boxes.map(([cx, cy, w, h], i) => {
      const seed = this.previewIndex() * 7 + i * 3; // deterministic "random" per image
      return toBox(
        cx + Math.sin(seed * 12.9898) * noise,
        cy + Math.cos(seed * 78.233) * noise * 0.8,
        w * (1 + Math.sin(seed * 3.1) * noise * 2.2),
        h * (1 + Math.cos(seed * 5.7) * noise * 2.2),
      );
    });
  });
  protected readonly lossPath = computed(() => curvePath(lossAt, this.progress()));
  protected readonly mapPath = computed(() => curvePath(mapAt, this.progress()));
  protected readonly lossNow = computed(() => lossAt(this.progress()));
  protected readonly mapNow = computed(() => Math.max(0, mapAt(this.progress())));
  /** The image list twice, so the conveyor loops without a gap (animation moves it by -50 %). */
  protected readonly conveyor = computed(() => [...this.train().images, ...this.train().images]);
}
