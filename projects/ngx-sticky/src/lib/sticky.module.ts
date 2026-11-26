import { NgModule } from '@angular/core';

import { NguiStickyDirective } from './sticky.directive';

@NgModule({
  imports: [NguiStickyDirective],
  exports: [NguiStickyDirective],
})
export class NguiStickyModule {}
