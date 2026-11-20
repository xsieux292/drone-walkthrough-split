import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { QueueEntry } from '../../../models';

/**
 * PART · 3.3.5 · The flight-queue page: slot time, "your turn" banner and the list of teams.
 *
 * Purely visual. One number drives it: `served` = how many teams at the top of the list are done.
 *   row i <  served → done (faded, ✓)
 *   row i == served → flying (or "ถึงคิว" if it is your team)
 *   row i >  served → waiting, position i - served + 1
 * The slot time is content.queue.slotLabel; empty → grey bar (not decided).
 */
@Component({
  selector: 'dw-queue-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './queue-board.html',
  styleUrl: './queue-board.scss',
})
export class DwQueueBoard {
  readonly queue = input<QueueEntry[]>([]);
  readonly slotLabel = input('');
  readonly served = input(0);

  protected readonly youIndex = computed(() => Math.max(0, this.queue().findIndex((q) => q.you)));
  protected readonly yourTurn = computed(() => this.served() >= this.youIndex());
  protected readonly ahead = computed(() => Math.max(0, this.youIndex() - this.served()));
  protected readonly rows = computed(() =>
    this.queue().map((q, i) => {
      const s = this.served();
      const state = i < s ? 'done' : i === s ? (q.you ? 'turn' : 'flying') : 'waiting';
      return { ...q, state, pos: i - s };
    }),
  );
}
