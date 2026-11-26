import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../../shared/ui/logo/logo.component';

@Component({
  selector: 'app-shop-footer',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  templateUrl: './shop-footer.component.html',
  styleUrl: './shop-footer.component.scss',
})
export class ShopFooterComponent {
  protected readonly year = new Date().getFullYear();
}
