import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Which face of the card is showing. 'hidden' = card not on screen yet. */
export type RegisterFormState = 'hidden' | 'team' | 'members' | 'done';

/**
 * PART · 3.3.1 · The registration card drawn over the website screenshot.
 *
 * Sections and labels copy the real form at https://nt-drone.ntplc.co.th/register (read 2026-11-20):
 *   face team     ข้อมูลทีมแข่งขัน (ชื่อทีม, มหาวิทยาลัย) + อาจารย์ที่ปรึกษา (ชื่อ, อีเมล, เบอร์)
 *   face members  สมาชิก 1-3 คน + คำถาม "ทักษะ/ความสามารถพิเศษ หรือประสบการณ์ที่เกี่ยวข้อง"
 *   face done     ลงทะเบียนสำเร็จ
 * Personal data is never shown: every field except the team name fills with a grey bar.
 *
 * Purely visual: no timers. The step (step-register.ts) drives every input.
 * Rows sit at fixed `top` values (see register-form.html) so the step can aim the cursor at them;
 * if you move a row, update AT in step-register.ts.
 */
@Component({
  selector: 'dw-register-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
  host: { '[class]': "'is-' + state()" },
})
export class DwRegisterForm {
  readonly state = input<RegisterFormState>('hidden');
  readonly teamName = input('');
  /** Characters of teamName typed so far. */
  readonly typed = input(0);
  /** 0..1, how full the other team / advisor fields look. */
  readonly teamFill = input(0);
  /** 0..1, how full the member fields look. */
  readonly memberFill = input(0);
  /** 0..1, how full the skills answer looks. */
  readonly answerFill = input(0);
  /** Confirm button pressed look. */
  readonly pressing = input(false);

  /** Used by the template to split the answer into two growing lines. */
  protected readonly Math = Math;
}
