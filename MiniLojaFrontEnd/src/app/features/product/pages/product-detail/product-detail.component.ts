import { ProductDetailFacade } from '../../facades/product-detail.facade';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '@core/cart/services/cart.service';
import { Product } from '@shared/models/product';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { ProductCardComponent } from '@shared/ui/product-card/product-card.component';
import { BuyBoxComponent } from '../../components/buy-box/buy-box.component';
import { ProductGalleryComponent } from '../../components/product-gallery/product-gallery.component';


@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent, ProductCardComponent, BuyBoxComponent, ProductGalleryComponent],
  providers: [ProductDetailFacade],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
  private readonly detail = inject(ProductDetailFacade);
  protected readonly cart = inject(CartService);

  protected readonly state = this.detail.state;
  protected readonly related = this.detail.related;
  protected retry(): void { this.detail.retry(); }

  protected shortName(p: Product): string { return p.name.split(' · ')[0]; }
  protected paragraphs(p: Product): string[] { return p.description.split(/\n{2,}/).filter(Boolean); }
}
