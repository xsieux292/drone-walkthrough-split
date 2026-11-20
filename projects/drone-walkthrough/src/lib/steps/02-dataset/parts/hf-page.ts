import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatasetFile } from '../../../models';

/** Access state of the gated dataset. */
export type HfAccess = 'locked' | 'loading' | 'granted';

/**
 * PART · 3.3.2 · A dark mock of the Hugging Face dataset page ("Files and versions" tab).
 *
 * Purely visual: the step drives it.
 *   access  locked  → file list blurred, gate box with "Agree and access repository"
 *           loading → spinner on the button
 *           granted → gate gone, file rows slide in one by one (`rows` = how many are visible)
 *   toast   green "Access granted" banner (top right)
 *
 * The gate button's centre is aimed at by BUTTON in step-dataset.ts. Move both together.
 */
@Component({
  selector: 'dw-hf-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hf-page.html',
  styleUrl: './hf-page.scss',
})
export class DwHfPage {
  /** Owner / org. Empty → grey bar (not decided). */
  readonly owner = input('');
  readonly repo = input('');
  readonly license = input('');
  readonly files = input<DatasetFile[]>([]);
  readonly access = input<HfAccess>('locked');
  readonly rows = input(0);
  readonly toast = input(false);
}
