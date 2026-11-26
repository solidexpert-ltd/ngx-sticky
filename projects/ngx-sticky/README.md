# @solidexpert/ngx-sticky

Angular directive that keeps an element stuck inside its container while the page scrolls. The public behavior matches `@ngui/sticky`: the `[ngui-sticky]` attribute, the `sticky-after` offset selector, and the `ngui-sticky-*` state classes.

This package is a port of [https://github.com/ng2-ui/sticky](https://github.com/ng2-ui/sticky) (`@ngui/sticky`, Angular 2). It is maintained by solidexpert-ltd.

## License

MIT. Copyright (c) 2016 Allen Kim <allenhwkim@gmail.com>.

## Install

```bash
npm install @solidexpert/ngx-sticky
```

Peer dependency: Angular `>=22`.

## Standalone

```typescript
import { Component } from '@angular/core';
import { NguiStickyDirective } from '@solidexpert/ngx-sticky';

@Component({
  selector: 'app-example',
  imports: [NguiStickyDirective],
  template: `
    <div class="top-header">Header</div>
    <div class="container">
      <div ngui-sticky sticky-after=".top-header">Sticks below the header</div>
    </div>
  `,
})
export class ExampleComponent {}
```

## NgModule

```typescript
import { NgModule } from '@angular/core';
import { NguiStickyModule } from '@solidexpert/ngx-sticky';

@NgModule({
  imports: [NguiStickyModule],
})
export class AppModule {}
```

```html
<div ngui-sticky>Sticks within its parent</div>
<div ngui-sticky sticky-after=".top-header"></div>
```

While stuck, the host receives `ngui-sticky-stuck`. At the start of the container it has `ngui-sticky-top` and `ngui-sticky-unstuck`. At the bottom of the container it has `ngui-sticky-bottom`. The parent receives `ngui-sticky-container`. A non-floated stuck element inserts an `ngui-sticky-filler` sibling so the layout does not collapse.
