import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DW_CONFIG, resolveAsset } from '../config';
import { MediaSource } from '../models';

/**
 * Shows an image, a video, an embed (e.g. YouTube) or an empty dashed box, chosen by media.kind.
 * Media with a `todo` note gets an orange "ต้องเปลี่ยน" badge (hidden when showTodoBadges is false).
 * A video plays only while `playing` is true, so off-screen steps do not burn CPU.
 */
@Component({
  selector: 'dw-media-slot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="slot" [class.empty]="isEmpty()">
      @switch (isEmpty() ? 'none' : media()?.kind) {
        @case ('image') {
          <img [src]="src()" [alt]="media()?.alt ?? ''" loading="lazy" decoding="async" />
        }
        @case ('video') {
          <video #video [src]="src()" [poster]="poster()" muted playsinline loop preload="metadata" [attr.aria-label]="media()?.alt ?? null"></video>
        }
        @case ('embed') {
          <iframe [src]="embedUrl()" title="{{ media()?.alt ?? 'video' }}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
        }
        @default {
          <div class="placeholder">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z M4 15l5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
            <strong>{{ emptyLabel() }}</strong>
            <span>ใส่ภาพหรือวิดีโอได้ทีหลัง (แก้ค่า media ใน content)</span>
          </div>
        }
      }
      @if (showBadge()) {
        <span class="todo" [attr.title]="media()?.todo">ต้องเปลี่ยน</span>
      }
      @if (media()?.caption && !isEmpty()) {
        <figcaption>{{ media()?.caption }}</figcaption>
      }
    </figure>
    @if (showBadge() && showNote()) {
      <p class="todo-note">⚠ {{ media()?.todo }}</p>
    }
  `,
  styleUrl: './media-slot.scss',
})
export class DwMediaSlot {
  readonly media = input<MediaSource | null | undefined>(null);
  readonly playing = input(false);
  readonly emptyLabel = input('ยังไม่มีสื่อ');
  /** Also print the todo note under the slot (handy in review builds). */
  readonly showNote = input(false);

  private readonly config = inject(DW_CONFIG);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');

  protected readonly isEmpty = computed(() => {
    const m = this.media();
    return !m || m.kind === 'none' || !m.src;
  });
  protected readonly src = computed(() => resolveAsset(this.config.assetBase, this.media()?.src));
  protected readonly poster = computed(() => resolveAsset(this.config.assetBase, this.media()?.poster));
  protected readonly embedUrl = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.src()));
  protected readonly showBadge = computed(() => this.config.showTodoBadges && !!this.media()?.todo);

  constructor() {
    effect(() => {
      const v = this.video()?.nativeElement;
      if (!v) return;
      if (this.playing()) {
        v.currentTime = 0;
        v.play().catch(() => {
          /* autoplay blocked: the poster stays, controls appear on hover */
          v.controls = true;
        });
      } else {
        v.pause();
      }
    });
  }
}
