import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import { DW_DEFAULT_CONTENT } from './content.default';
import { StepChangeEvent, WalkthroughContent, WalkthroughMode } from './models';
import { DwStage } from './shared/stage';
import { DwStepCode } from './steps/03-code/step-code';
import { DwStepDataset } from './steps/02-dataset/step-dataset';
import { DwStepQueue } from './steps/05-queue/step-queue';
import { DwStepRegister } from './steps/01-register/step-register';
import { DwStepResults } from './steps/06-results/step-results';
import { DwStepRoute } from './steps/04-route/step-route';
import { prefersReducedMotion } from './util/sequencer';

/**
 * <dw-walkthrough> — the 3.3 walkthrough shell.
 *
 * Owns the clock: which step is current, which beat inside it, and autoplay. Steps only render.
 *   scroll mode  every step is a section on the page; the one crossing the middle of the viewport is current
 *   slides mode  one step at a time, filling the component (for presenting or screen-recording a clip)
 *
 * Controls: ▶ / ◀ buttons, ← → keys (while the walkthrough is on screen), click a beat or a step chip.
 */
@Component({
  selector: 'dw-walkthrough',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DwStage, DwStepRegister, DwStepDataset, DwStepCode, DwStepRoute, DwStepQueue, DwStepResults],
  templateUrl: './walkthrough.html',
  styleUrl: './walkthrough.scss',
  host: {
    '[class.mode-slides]': "mode() === 'slides'",
    '[class.mode-scroll]': "mode() === 'scroll'",
    '(document:keydown)': 'onKey($event)',
  },
})
export class DwWalkthrough {
  /** Text, media and tables. Defaults to the built-in Thai content. */
  readonly content = input<WalkthroughContent>(DW_DEFAULT_CONTENT);
  readonly mode = input<WalkthroughMode>('scroll');
  /** Play beats automatically when a step becomes current. */
  readonly autoplay = input(true, { transform: booleanAttribute });
  /** At the end of a step's beats, go on to the next step (slides mode only). */
  readonly autoAdvance = input(true, { transform: booleanAttribute });
  /** Show the heading block above the steps. */
  readonly showIntro = input(true, { transform: booleanAttribute });
  /** Listen to ← → keys while the walkthrough is on screen. */
  readonly keyboard = input(true, { transform: booleanAttribute });
  readonly startStep = input(0);

  readonly stepChange = output<StepChangeEvent>();

  protected readonly steps = computed(() => this.content().steps);
  protected readonly stepIndex = signal(0);
  protected readonly beat = signal(0);
  protected readonly playing = signal(!prefersReducedMotion());
  /** Bumps on every (re)start of a beat so the progress bar animation restarts. */
  protected readonly beatRun = signal(0);

  protected readonly current = computed(() => this.steps()[this.stepIndex()]);
  protected readonly beatCount = computed(() => this.current()?.beats.length ?? 1);
  protected readonly isLast = computed(() => this.stepIndex() === this.steps().length - 1 && this.beat() === this.beatCount() - 1);
  protected readonly isFirst = computed(() => this.stepIndex() === 0 && this.beat() === 0);
  protected readonly beatMs = computed(() => this.current()?.beats[this.beat()]?.ms ?? 3000);

  private readonly host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly sections = viewChildren<ElementRef<HTMLElement>>('section');
  private inView = false;
  private ignoreScrollUntil = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const start = Math.min(Math.max(0, this.startStep()), this.steps().length - 1);
      untracked(() => this.stepIndex.set(start));
    });

    // Autoplay clock: after the current beat's duration, go to the next beat (or step in slides mode).
    effect((onCleanup) => {
      const playing = this.playing() && this.autoplay();
      const ms = this.beatMs();
      this.beatRun();
      if (!playing) return;
      const t = setTimeout(() => {
        if (this.beat() < this.beatCount() - 1) this.beat.update((b) => b + 1);
        else if (this.mode() === 'slides' && this.autoAdvance() && this.stepIndex() < this.steps().length - 1) this.goTo(this.stepIndex() + 1, 0);
        else this.playing.set(false);
      }, ms);
      onCleanup(() => clearTimeout(t));
    });

    effect(() => {
      const i = this.stepIndex();
      const b = this.beat();
      const step = this.steps()[i];
      if (step) untracked(() => this.stepChange.emit({ stepIndex: i, stepId: step.id, beat: b }));
    });

    // Which section crosses the middle band of the viewport is the current one.
    let io: IntersectionObserver | undefined;
    afterNextRender(() => {
      io = new IntersectionObserver((entries) => this.onIntersect(entries), { rootMargin: '-45% 0px -45% 0px' });
      this.sections().forEach((s) => io!.observe(s.nativeElement));
      const hostIo = new IntersectionObserver(([e]) => (this.inView = e.isIntersecting));
      hostIo.observe(this.host);
      destroyRef.onDestroy(() => {
        io?.disconnect();
        hostIo.disconnect();
      });
    });
    // Sections come and go when switching mode: re-observe whatever is rendered.
    effect(() => {
      const secs = this.sections();
      if (!io) return;
      io.disconnect();
      secs.forEach((s) => io!.observe(s.nativeElement));
    });
  }

  private onIntersect(entries: IntersectionObserverEntry[]): void {
    if (this.mode() !== 'scroll' || Date.now() < this.ignoreScrollUntil) return;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const i = Number((e.target as HTMLElement).dataset['index']);
      if (i !== this.stepIndex()) {
        this.stepIndex.set(i);
        this.beat.set(0);
        this.beatRun.update((n) => n + 1);
        if (this.autoplay() && !prefersReducedMotion()) this.playing.set(true);
      }
    }
  }

  // ------------------------------------------------------------------ navigation

  next(): void {
    if (this.beat() < this.beatCount() - 1) this.setBeat(this.beat() + 1);
    else if (this.stepIndex() < this.steps().length - 1) this.goTo(this.stepIndex() + 1, 0, true);
  }

  prev(): void {
    if (this.beat() > 0) this.setBeat(this.beat() - 1);
    else if (this.stepIndex() > 0) {
      const i = this.stepIndex() - 1;
      this.goTo(i, this.steps()[i].beats.length - 1, true);
    }
  }

  togglePlay(): void {
    if (!this.playing() && this.isLast()) this.goTo(0, 0, true);
    this.playing.update((p) => !p);
    this.beatRun.update((n) => n + 1);
  }

  /** Jump to a beat of the current step (manual: pauses autoplay so the viewer stays in control). */
  setBeat(b: number, pause = true): void {
    if (pause) this.playing.set(false);
    this.beat.set(b);
    this.beatRun.update((n) => n + 1);
  }

  goTo(stepIndex: number, beat = 0, manual = false): void {
    if (manual) this.playing.set(false);
    this.stepIndex.set(stepIndex);
    this.beat.set(beat);
    this.beatRun.update((n) => n + 1);
    if (this.mode() === 'scroll') {
      const el = this.sections()[stepIndex]?.nativeElement;
      if (el) {
        this.ignoreScrollUntil = Date.now() + 1200;
        el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      }
    }
  }

  /** Step chip click: start that step from its first beat and play. */
  jump(i: number): void {
    this.goTo(i, 0);
    if (this.autoplay() && !prefersReducedMotion()) this.playing.set(true);
  }

  fullscreen(): void {
    if (document.fullscreenElement) document.exitFullscreen();
    else this.host.requestFullscreen?.();
  }

  protected onKey(e: KeyboardEvent): void {
    if (!this.keyboard() || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (this.mode() === 'scroll' && !this.inView) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    }
  }

  protected isActive(i: number): boolean {
    return i === this.stepIndex();
  }

  protected beatFor(i: number): number {
    return i === this.stepIndex() ? this.beat() : 0;
  }

  /** In scroll mode every step renders; in slides mode only the current one. */
  protected rendered(i: number): boolean {
    return this.mode() === 'scroll' || i === this.stepIndex();
  }
}
