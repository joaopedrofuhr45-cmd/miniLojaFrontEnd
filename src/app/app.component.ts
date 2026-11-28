import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RevealService } from './shared/effects/reveal.service';
import { ScrollEffectsService } from './shared/effects/scroll-effects.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'MiniLojaFrontEnd';

  constructor() {
    inject(ScrollEffectsService).start();
    inject(RevealService).start();
  }
}
