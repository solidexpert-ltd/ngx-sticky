import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NguiStickyDirective } from './sticky.directive';

@Component({
  standalone: true,
  imports: [NguiStickyDirective],
  template: `
    <div class="top-header"></div>
    <div class="container">
      <div ngui-sticky sticky-after=".top-header">sticky</div>
    </div>
  `,
})
class HostComponent {}

describe('NguiStickyDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('marks the host unstuck at the top and the parent as the container', () => {
    const host = fixture.nativeElement.querySelector('[ngui-sticky]') as HTMLElement;
    const parent = host.parentElement as HTMLElement;

    expect(host.classList.contains('ngui-sticky-unstuck')).toBe(true);
    expect(host.classList.contains('ngui-sticky-top')).toBe(true);
    expect(parent.classList.contains('ngui-sticky-container')).toBe(true);
    expect(host.style.boxSizing).toBe('border-box');
  });
});
