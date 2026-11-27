import { Component, inject } from '@angular/core';
import { HomeFacade } from '../../facades/home.facade';
import { CartService } from '@core/cart/services/cart.service';
import { BenefitsStripComponent } from '../../components/benefits-strip/benefits-strip.component';
import { CategoryShortcutsComponent } from '../../components/category-shortcuts/category-shortcuts.component';
import { HeroBannerComponent } from '../../components/hero-banner/hero-banner.component';
import { ProductShowcaseComponent } from '../../components/product-showcase/product-showcase.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HeroBannerComponent, BenefitsStripComponent, CategoryShortcutsComponent, ProductShowcaseComponent],
  providers: [HomeFacade],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly home = inject(HomeFacade);
  protected readonly cart = inject(CartService);

  protected readonly categories = this.home.categories;
  protected readonly offers = this.home.offers;
  protected readonly latest = this.home.latest;
}
