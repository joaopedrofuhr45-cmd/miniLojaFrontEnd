import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category } from '../../shared/models/category';
import { Page } from '../../shared/models/page';
import { Product } from '../../shared/models/product';
import { StoreInfo } from '../../shared/models/store-info';
import { AuthUser } from '../../shared/models/user';

/** Login fictício (dev): joao@exemplo.com / 123456 */
export const MOCK_LOGIN = { email: 'joao@exemplo.com', password: '123456' };
const MOCK_USER: AuthUser = { id: 0, name: 'João Pedro Fuhr', email: MOCK_LOGIN.email, role: 'USER' };

/** Dados fictícios para ver a loja sem o Spring Boot. Só atua em dev com `environment.mock = true`. */

const CATEGORIES: Category[] = [
  { id: 1, name: 'Jaquetas', productCount: 4 },
  { id: 2, name: 'Camisetas', productCount: 4 },
  { id: 3, name: 'Calças', productCount: 4 },
];

const cat = (id: number) => ({ id, name: CATEGORIES.find((c) => c.id === id)!.name });
const p = (id: number, name: string, category: number, price: number, originalPrice: number | null, description: string): Product =>
  ({ id, name, description, price, originalPrice, stock: 12, imageUrl: null, active: true, category: cat(category) });

// id maior = mais novo
const PRODUCTS: Product[] = [
  p(1, 'Jaqueta preta', 1, 289, 359, 'Jaqueta preta de sarja, forro leve, ideal para o ano todo.'),
  p(2, 'Jaqueta corta-vento', 1, 219, null, 'Corta-vento leve e dobrável, com capuz.'),
  p(3, 'Jaqueta jeans', 1, 249, 299, 'Jeans lavado, corte reto e bolsos frontais.'),
  p(4, 'Jaqueta bomber verde', 1, 329, null, 'Bomber em verde musgo com acabamento em ribana.'),
  p(5, 'Camiseta básica off-white', 2, 59.9, null, 'Algodão penteado, caimento solto.'),
  p(6, 'Camiseta oversized preta', 2, 79.9, 99.9, 'Oversized, malha pesada de 220 g.'),
  p(7, 'Camiseta estampada', 2, 89.9, null, 'Estampa em silk, 100% algodão.'),
  p(8, 'Camiseta gola polo', 2, 119, 149, 'Gola polo em piquet, três botões.'),
  p(9, 'Calça cargo', 3, 199, 249, 'Cargo com bolsos laterais e cós ajustável.'),
  p(10, 'Calça jeans reta', 3, 179, null, 'Jeans reto com elastano, cintura média.'),
  p(11, 'Calça de alfaiataria', 3, 229, null, 'Alfaiataria leve, vinco frontal.'),
  p(12, 'Calça jogger', 3, 149, 189, 'Jogger de moletom com punho.'),
];

const STORE_INFO: StoreInfo = { freeShippingThreshold: 199, shippingFee: 15, maxInstallments: 10, returnDays: 7 };

function listProducts(q: URLSearchParams): Page<Product> {
  let out = PRODUCTS.filter((x) => x.active);
  const search = q.get('search')?.toLowerCase();
  if (search) out = out.filter((x) => x.name.toLowerCase().includes(search));
  if (q.get('category')) out = out.filter((x) => x.category.id === Number(q.get('category')));
  if (q.get('minPrice')) out = out.filter((x) => x.price >= Number(q.get('minPrice')));
  if (q.get('maxPrice')) out = out.filter((x) => x.price <= Number(q.get('maxPrice')));
  if (q.get('onSale') === 'true') out = out.filter((x) => x.originalPrice !== null);
  const sort = q.get('sort');
  if (sort === 'price_asc') out = [...out].sort((a, b) => a.price - b.price);
  else if (sort === 'price_desc') out = [...out].sort((a, b) => b.price - a.price);
  else if (sort === 'newest') out = [...out].sort((a, b) => b.id - a.id);
  const size = Number(q.get('size') ?? 8);
  const page = Number(q.get('page') ?? 0);
  return {
    content: out.slice(page * size, page * size + size),
    page, size, totalElements: out.length, totalPages: Math.max(1, Math.ceil(out.length / size)),
  };
}

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.mock) return next(req);
  const url = new URL(req.urlWithParams, 'http://x');
  const path = url.pathname.replace(/^\/api/, '');

  if (req.method === 'POST' && path === '/auth/login') {
    const b = req.body as { email?: string; password?: string } | null;
    if (b?.email?.trim().toLowerCase() === MOCK_LOGIN.email && b.password === MOCK_LOGIN.password) {
      return of(new HttpResponse({ status: 200, body: { token: 'mock-token', user: MOCK_USER } })).pipe(delay(300));
    }
    return throwError(() => new HttpErrorResponse({ status: 401, error: { status: 401, error: 'Unauthorized', message: 'E-mail ou senha inválidos' } }));
  }
  if (req.method === 'POST' && path === '/auth/register') {
    const b = req.body as { name?: string; email?: string } | null;
    return of(new HttpResponse({ status: 201, body: { token: 'mock-token', user: { ...MOCK_USER, name: b?.name ?? MOCK_USER.name, email: b?.email ?? MOCK_USER.email } } })).pipe(delay(300));
  }
  if (req.method !== 'GET') return next(req);
  if (path === '/users/me') return of(new HttpResponse({ status: 200, body: { ...MOCK_USER, address: null } }));
  let body: unknown;
  if (path === '/store-info') body = STORE_INFO;
  else if (path === '/categories') body = CATEGORIES;
  else if (path === '/products') body = listProducts(url.searchParams);
  else if (/^\/products\/\d+$/.test(path)) body = PRODUCTS.find((x) => x.id === Number(path.split('/')[2]));
  else return next(req);
  return body === undefined
    ? next(req)
    : of(new HttpResponse({ status: 200, body })).pipe(delay(150));
};
