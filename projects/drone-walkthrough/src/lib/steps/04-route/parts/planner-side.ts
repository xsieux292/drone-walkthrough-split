import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface PlanItem {
  n: number;
  name: string;
  kind: string;
  time: string;
}

export interface PlanCheck {
  label: string;
  state: 'idle' | 'run' | 'ok';
}

export type PlanStatus = 'draft' | 'checking' | 'ok';

/**
 * PART · 3.3.4 · Right-hand panel of the mock Route Planner:
 * flight-time bar · status box · list of drawn items · rule checks.
 * Purely visual; the step sets every input.
 */
@Component({
  selector: 'dw-planner-side',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './planner-side.html',
  styleUrl: './planner-side.scss',
})
export class DwPlannerSide {
  readonly timeUsed = input(0);
  readonly timeLimit = input(900);
  readonly status = input<PlanStatus>('draft');
  readonly items = input<PlanItem[]>([]);
  readonly checks = input<PlanCheck[]>([]);

  protected readonly timePct = computed(() => Math.min(100, (this.timeUsed() / this.timeLimit()) * 100));
}
