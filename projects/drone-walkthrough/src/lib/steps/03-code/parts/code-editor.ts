import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CodeFile } from '../../../models';
import { Token, sliceTokens, tokenize } from '../../../util/highlight';

/**
 * PART · 3.3.3 · "Code hero" scene: a floating IDE window on a dark gradient with glowing blobs and
 * floating chips (landing-page style). Types one file at a time with syntax colours.
 *
 * Purely visual: the step sets `fileIndex`, `typed` (characters shown) and `termLines`.
 * Colours of the syntax classes (.kw .str .com …) are at the bottom of code-editor.scss.
 * The chips' text is in code-editor.html (search "chip").
 */
@Component({
  selector: 'dw-code-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-editor.html',
  styleUrl: './code-editor.scss',
})
export class DwCodeEditor {
  readonly files = input<CodeFile[]>([]);
  readonly fileIndex = input(0);
  /** Characters of the current file typed so far. */
  readonly typed = input(0);
  readonly terminal = input<string[]>([]);
  /** How many terminal lines are visible. */
  readonly termLines = input(0);
  /** Project folder name shown in the title bar and explorer. */
  readonly project = input('team07');

  /** Tokens for every file, computed once per content change. */
  private readonly tokens = computed(() => this.files().map((f) => tokenize(f.code)));
  protected readonly file = computed(() => this.files()[this.fileIndex()] ?? this.files()[0]);
  protected readonly visible = computed<Token[]>(() => sliceTokens(this.tokens()[this.fileIndex()] ?? [], this.typed()));
  /** Line numbers: at least 14 rows so the editor never looks empty. */
  protected readonly lineNumbers = computed(() => {
    const shown = this.visible().reduce((n, t) => n + (t.text.match(/\n/g)?.length ?? 0), 0);
    return Array.from({ length: Math.max(shown + 1, 14) }, (_, i) => i + 1);
  });
}
