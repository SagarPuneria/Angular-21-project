import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ALL_PRODUCTS, Product } from './products.data';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  products: Product[] = ALL_PRODUCTS;
}
