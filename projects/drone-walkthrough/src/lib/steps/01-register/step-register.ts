import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DW_DEFAULT_CONTENT } from '../../content.default';
import { RegisterContent } from '../../models';
import { DwBrowserFrame } from '../../shared/browser-frame';
import { DwCursor } from '../../shared/cursor';
import { DwMediaSlot } from '../../shared/media-slot';
import { CursorState, hiddenCursor, moveAndClick, placeCursor } from '../../util/cursor-script';
import { DwStepBase } from '../step-base';
import { DwRegisterForm, RegisterFormState } from './parts/register-form';

/* ════════════════════════════════════════════════════════════════════════════════
 * STEP 3.3.1 · สมัคร และตอบคำถามผ่านเว็บ  (https://nt-drone.ntplc.co.th)
 *
 * This file = the TIMELINE only (what happens on each beat, and when).
 * Visual pieces live in their own files:
 *   step-register.html / .scss   stage layout: browser frame + two screenshots (home, consent) + dim layer
 *   parts/register-form.*        the form card (faces: team / members / done), labels from the real form
 *   shared/media-slot            image / video / empty box (content.register.media / consentMedia)
 *
 * Beats (labels + autoplay durations are in content.default.ts → steps[0].beats):
 *   0  home page; cursor clicks "สมัครแข่งขัน"            → page switches to /register (consent dialog)
 *   1  cursor clicks "ยินยอมและเริ่มสมัคร"                → form card appears (team face)
 *   2  type the team name, other team / advisor fields fill
 *   3  members face: member fields fill, then the skills question
 *   4  press "ยืนยันการลงทะเบียน"                          → "ลงทะเบียนสำเร็จ"
 * ════════════════════════════════════════════════════════════════════════════════ */

// ── Layout (stage px, 960×600). Change together with step-register.scss / register-form.html ──
/** Top-left of the form card on the stage. */
const CARD = { x: 500, y: 92 };
/**
 * Cursor targets. The two screenshot buttons are measured on the 1440×826 crops shown "cover" in the
 * 900×516 browser body at (30, 60): stage = 30 + x·0.625, 60 + y·0.625. Re-measure if a screenshot changes.
 */
const AT = {
  start: { x: 520, y: 250 },
  siteButton: { x: 142, y: 428 }, // home hero "สมัครแข่งขัน"  (crop 180, 589)
  consentButton: { x: 707, y: 487 }, // "ยินยอมและเริ่มสมัคร"      (crop 1083, 683)
  teamInput: { x: CARD.x + 200, y: CARD.y + 96 },
  skillsAnswer: { x: CARD.x + 200, y: CARD.y + 334 },
  submit: { x: CARD.x + 200, y: CARD.y + 414 },
};

// ── Timing (ms) ──
const T = {
  firstPause: 900, // before the cursor starts moving on beat 0
  pageSwitch: 350, // after a click, before the next screen shows
  typeChar: 110, // per character of the team name
  fillTeam: 1300, // grey bars in the team / advisor fields
  fillMembers: 1100,
  fillAnswer: 1000,
  afterSubmit: 500,
};

/** Which screenshot is in the browser. */
type Page = 'home' | 'consent';

@Component({
  selector: 'dw-step-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DwBrowserFrame, DwMediaSlot, DwCursor, DwRegisterForm],
  templateUrl: './step-register.html',
  styleUrl: './step-register.scss',
})
export class DwStepRegister extends DwStepBase {
  readonly content = input<RegisterContent>(DW_DEFAULT_CONTENT.register);

  // ── State read by the template / parts ──
  protected readonly page = signal<Page>('home');
  protected readonly card = signal<RegisterFormState>('hidden');
  protected readonly typed = signal(0);
  protected readonly teamFill = signal(0);
  protected readonly memberFill = signal(0);
  protected readonly answerFill = signal(0);
  protected readonly pressing = signal(false);
  protected readonly cursor = signal<CursorState>(hiddenCursor());
  protected readonly CARD = CARD;

  protected readonly url = computed(() => (this.page() === 'home' ? this.content().url : this.content().registerUrl));

  /** End state after `n` beats have finished (no animation). */
  protected settle(n: number): void {
    this.page.set(n >= 1 ? 'consent' : 'home');
    this.card.set(n >= 5 ? 'done' : n >= 4 ? 'members' : n >= 2 ? 'team' : 'hidden');
    this.typed.set(n >= 3 ? this.content().teamName.length : 0);
    this.teamFill.set(n >= 3 ? 1 : 0);
    this.memberFill.set(n >= 4 ? 1 : 0);
    this.answerFill.set(n >= 4 ? 1 : 0);
    this.pressing.set(false);
    this.cursor.set(hiddenCursor());
  }

  /** Animate one beat, starting from settle(beat). */
  protected animate(beat: number): void {
    this.seq.run(async (s) => {
      switch (beat) {
        // ── beat 0 · home page → click "สมัครแข่งขัน" ──
        case 0: {
          placeCursor(this.cursor, AT.start);
          await s.wait(T.firstPause);
          await moveAndClick(s, this.cursor, AT.siteButton, 900);
          await s.wait(T.pageSwitch);
          this.page.set('consent');
          break;
        }
        // ── beat 1 · consent → "ยินยอมและเริ่มสมัคร" ──
        case 1: {
          placeCursor(this.cursor, AT.siteButton);
          await s.wait(250);
          await moveAndClick(s, this.cursor, AT.consentButton, 900);
          await s.wait(T.pageSwitch);
          this.card.set('team');
          break;
        }
        // ── beat 2 · team + advisor ──
        case 2: {
          placeCursor(this.cursor, AT.consentButton);
          await s.wait(150);
          await moveAndClick(s, this.cursor, AT.teamInput);
          for (let i = 1; i <= this.content().teamName.length; i++) {
            this.typed.set(i);
            await s.wait(T.typeChar);
          }
          await s.tween(T.fillTeam, (t) => this.teamFill.set(t));
          break;
        }
        // ── beat 3 · members + skills question ──
        case 3: {
          this.card.set('members');
          placeCursor(this.cursor, AT.teamInput);
          await s.wait(300);
          await s.tween(T.fillMembers, (t) => this.memberFill.set(t));
          await moveAndClick(s, this.cursor, AT.skillsAnswer, 500);
          await s.tween(T.fillAnswer, (t) => this.answerFill.set(t));
          break;
        }
        // ── beat 4 · confirm ──
        case 4: {
          placeCursor(this.cursor, AT.skillsAnswer);
          await s.wait(300);
          this.pressing.set(true);
          await moveAndClick(s, this.cursor, AT.submit, 600);
          await s.wait(T.afterSubmit);
          this.pressing.set(false);
          this.card.set('done');
          this.cursor.update((c) => ({ ...c, show: false }));
          break;
        }
      }
    });
  }
}
