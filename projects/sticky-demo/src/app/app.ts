import { Component } from '@angular/core';
import { NguiStickyDirective } from '@solidexpert/ngx-sticky';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NguiStickyDirective],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
