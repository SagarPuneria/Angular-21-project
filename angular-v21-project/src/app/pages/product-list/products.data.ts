export interface Product {
  id: number;
  name: string;
  price: number;
}

export const ALL_PRODUCTS: Product[] = [
  { id: 1, name: 'Angular Book', price: 29 },
  { id: 2, name: 'TypeScript Course', price: 49 },
  { id: 3, name: 'RxJS Guide', price: 19 },
];
