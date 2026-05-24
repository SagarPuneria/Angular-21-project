import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ALL_PRODUCTS, Product } from '../product-list/products.data';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  // Route param :id is automatically bound via withComponentInputBinding() in app.config.ts
  id = input<string>('');

  product = computed<Product | undefined>(() =>
    ALL_PRODUCTS.find(p => String(p.id) === this.id()),
  );
}
