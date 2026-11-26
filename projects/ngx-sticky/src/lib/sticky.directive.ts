import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';

import { computedStyle } from './computed-style';

interface OriginalMetrics {
  boundingClientRect: DOMRect;
  position: string;
  float: string;
  top: string;
  bottom: string;
  left: string;
  width: string;
  offsetTop: number;
  offsetLeft: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

interface OffsetDiff {
  top: number;
  left: number;
}

/**
 * Attribute directive that sticks its host while the parent container is in view.
 * Selector and class names match @ngui/sticky 0.6.3.
 */
@Directive({
  selector: '[ngui-sticky]',
  standalone: true,
})
export class NguiStickyDirective implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** CSS selector of an element whose bottom edge becomes the sticky offset. */
  @Input('sticky-after') stickyAfter?: string;

  protected el: HTMLElement = this.host.nativeElement;
  protected parentEl: HTMLElement | null = this.el.parentElement;
  protected fillerEl?: HTMLElement;
  protected stickyAfterElement: HTMLElement | null = null;
  protected diff?: OffsetDiff;
  protected original?: OriginalMetrics;

  protected readonly STICKY_CLASSES = {
    STUCK: 'ngui-sticky-stuck',
    UNSTUCK: 'ngui-sticky-unstuck',
    TOP: 'ngui-sticky-top',
    BOTTOM: 'ngui-sticky-bottom',
    FILLER: 'ngui-sticky-filler',
    CONTAINER: 'ngui-sticky-container',
  } as const;

  private attached = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId) || !this.parentEl) {
      return;
    }

    const parentEl = this.parentEl;
    this.el.style.boxSizing = 'border-box';
    this.renderer.addClass(this.el, this.STICKY_CLASSES.UNSTUCK);
    this.renderer.addClass(this.el, this.STICKY_CLASSES.TOP);
    this.renderer.addClass(parentEl, this.STICKY_CLASSES.CONTAINER);

    if (this.stickyAfter) {
      this.stickyAfterElement = document.querySelector(this.stickyAfter) as HTMLElement | null;
    }

    const allowedPositions = ['absolute', 'fixed', 'relative'];
    const parentElPosition = computedStyle(parentEl, 'position');
    if (allowedPositions.indexOf(parentElPosition) === -1) {
      parentEl.style.position = 'relative';
    }

    this.diff = {
      top: this.el.offsetTop - parentEl.offsetTop,
      left: this.el.offsetLeft - parentEl.offsetLeft,
    };

    const elRect = this.el.getBoundingClientRect();
    this.original = {
      boundingClientRect: elRect,
      position: computedStyle(this.el, 'position'),
      float: computedStyle(this.el, 'float'),
      top: computedStyle(this.el, 'top'),
      bottom: computedStyle(this.el, 'bottom'),
      left: computedStyle(this.el, 'left'),
      width: computedStyle(this.el, 'width'),
      offsetTop: this.el.offsetTop,
      offsetLeft: this.el.offsetLeft,
      marginTop: parseInt(computedStyle(this.el, 'marginTop'), 10),
      marginBottom: parseInt(computedStyle(this.el, 'marginBottom'), 10),
      marginLeft: parseInt(computedStyle(this.el, 'marginLeft'), 10),
      // Preserved from @ngui/sticky 0.6.3, which reads margin-left for this field.
      marginRight: parseInt(computedStyle(this.el, 'marginLeft'), 10),
    };

    this.attach();
  }

  ngOnDestroy(): void {
    this.detach();
  }

  protected attach(): void {
    if (this.attached) {
      return;
    }
    window.addEventListener('scroll', this.scrollHandler);
    window.addEventListener('resize', this.scrollHandler);
    this.attached = true;
  }

  protected detach(): void {
    if (!this.attached) {
      return;
    }
    window.removeEventListener('scroll', this.scrollHandler);
    window.removeEventListener('resize', this.scrollHandler);
    this.attached = false;
  }

  protected scrollHandler = (): void => {
    const parent = this.el.parentElement;
    const original = this.original;
    if (!parent || !original) {
      return;
    }

    const parentRect = parent.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
    const stickyOffsetTop = this.stickyAfterElement
      ? this.stickyAfterElement.getBoundingClientRect().bottom
      : 0;

    let dynProps: Partial<CSSStyleDeclaration>;
    if (original.float === 'right') {
      const right = bodyRect.right - parentRect.right + original.marginRight;
      dynProps = { right: right + 'px' };
    } else if (original.float === 'left') {
      const left = parentRect.left - bodyRect.left + original.marginLeft;
      dynProps = { left: left + 'px' };
    } else {
      dynProps = { width: parentRect.width + 'px' };
    }

    if (
      original.marginTop + original.marginBottom + original.boundingClientRect.height + stickyOffsetTop >=
      parentRect.bottom
    ) {
      const floatAdjustment: Partial<CSSStyleDeclaration> =
        original.float === 'right' ? { right: '0' } : original.float === 'left' ? { left: '0' } : {};
      Object.assign(
        this.el.style,
        {
          position: 'absolute',
          float: 'none',
          top: 'inherit',
          bottom: '0',
        },
        dynProps,
        floatAdjustment,
      );
      this.renderer.removeClass(this.el, this.STICKY_CLASSES.STUCK);
      this.renderer.removeClass(this.el, this.STICKY_CLASSES.TOP);
      this.renderer.addClass(this.el, this.STICKY_CLASSES.UNSTUCK);
      this.renderer.addClass(this.el, this.STICKY_CLASSES.BOTTOM);
      return;
    }

    if (parentRect.top * -1 + original.marginTop + stickyOffsetTop > original.offsetTop) {
      if (original.float !== 'left' && original.float !== 'right' && !this.fillerEl && this.parentEl) {
        this.fillerEl = document.createElement('div');
        this.fillerEl.style.height = this.el.offsetHeight + 'px';
        this.renderer.addClass(this.fillerEl, this.STICKY_CLASSES.FILLER);
        this.parentEl.insertBefore(this.fillerEl, this.el);
      }

      Object.assign(
        this.el.style,
        {
          position: 'fixed',
          float: 'none',
          top: stickyOffsetTop + 'px',
          bottom: 'inherit',
        },
        dynProps,
      );
      this.renderer.removeClass(this.el, this.STICKY_CLASSES.UNSTUCK);
      this.renderer.removeClass(this.el, this.STICKY_CLASSES.TOP);
      this.renderer.removeClass(this.el, this.STICKY_CLASSES.BOTTOM);
      this.renderer.addClass(this.el, this.STICKY_CLASSES.STUCK);
      return;
    }

    if (this.fillerEl && this.parentEl) {
      this.parentEl.removeChild(this.fillerEl);
      this.fillerEl = undefined;
    }
    Object.assign(
      this.el.style,
      {
        position: original.position,
        float: original.float,
        top: original.top,
        bottom: original.bottom,
        width: original.width,
        left: original.left,
      },
      dynProps,
    );
    this.renderer.removeClass(this.el, this.STICKY_CLASSES.STUCK);
    this.renderer.removeClass(this.el, this.STICKY_CLASSES.BOTTOM);
    this.renderer.addClass(this.el, this.STICKY_CLASSES.UNSTUCK);
    this.renderer.addClass(this.el, this.STICKY_CLASSES.TOP);
  };
}
