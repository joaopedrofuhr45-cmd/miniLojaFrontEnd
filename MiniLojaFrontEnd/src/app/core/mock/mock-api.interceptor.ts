import { HttpErrorResponse, HttpInterceptorFn, HttpParams, HttpResponse } from '@angular/common/http';
import { mergeMap, of, throwError, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiFieldError } from '../../shared/models/api-error';
import { CreateOrderRequest, OrderStatus } from '../../shared/models/order';
import { Page } from '../../shared/models/page';
import { AuthResponse, AuthUser } from '../../shared/models/user';
import { nextStatuses } from '../../shared/utils/order-flow';
import { CATEGORIES, DEFAULT_ADDRESS, MockOrder, MockProduct, ORDERS, PRODUCTS, shortName, takeOrderId } from './mock-data';

/**
 * API simulada: responde no próprio front para dar pra desenvolver/demonstrar sem o Spring Boot no ar.
 * Ligada por `environment.useMock`. Os dados vivem em memória (recarregar a página reinicia).
 * Login: qualquer e-mail com senha de 3+ caracteres; e-mail contendo "admin" entra como ADMIN.
 */
class ApiErr extends Error {
  constructor(public status: number, message: string, public fields?: ApiFieldError[]) { super(message); }
}

interface Ctx { q: HttpParams; m: RegExpExecArray; body: any; user: AuthUser | null; }
type Handler = (c: Ctx) => unknown;

const num = (q: HttpParams, k: string) => (q.get(k) != null ? Number(q.get(k)) : null);
const byId = (id: number) => PRODUCTS.find((p) => p.id === id);
const need = <T>(v: T | undefined | null, msg = 'Não encontrado'): T => { if (v == null) throw new ApiErr(404, msg); return v; };

function paginate<T>(list: T[], q: HttpParams, defSize = 8): Page<T> {
  const size = num(q, 'size') ?? defSize;
  const page = num(q, 'page') ?? 0;
  return { content: list.slice(page * size, page * size + size), page, size, totalElements: list.length, totalPages: Math.max(1, Math.ceil(list.length / size)) };
}

function session(email: string, name?: string): AuthResponse {
  const local = email.split('@')[0];
  const isAdmin = email.includes('admin');
  const user: AuthUser = {
    id: isAdmin ? 1 : 2, email, role: isAdmin ? 'ADMIN' : 'USER',
    name: name ?? (isAdmin ? 'Admin MiniLoja' : local.startsWith('joao') ? 'João Pedro' : local.charAt(0).toUpperCase() + local.slice(1)),
  };
  return { token: 'mock.' + encodeURIComponent(JSON.stringify(user)), user };
}

function filterProducts(list: MockProduct[], q: HttpParams): MockProduct[] {
  const s = q.get('search')?.toLowerCase();
  if (s) list = list.filter((p) => `${p.name} ${p.category.name}`.toLowerCase().includes(s));
  const cat = num(q, 'category'); if (cat) list = list.filter((p) => p.category.id === cat);
  const min = num(q, 'minPrice'); if (min != null) list = list.filter((p) => p.price >= min);
  const max = num(q, 'maxPrice'); if (max != null) list = list.filter((p) => p.price <= max);
  if (q.get('onSale') === 'true') list = list.filter((p) => p.originalPrice);
  const sorts: Record<string, (a: MockProduct, b: MockProduct) => number> = {
    price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id,
  };
  const sort = sorts[q.get('sort') ?? ''];
  return sort ? [...list].sort(sort) : list;
}

function filterOrders(list: MockOrder[], q: HttpParams): MockOrder[] {
  const status = q.get('status'); if (status) list = list.filter((o) => o.status === status);
  const s = q.get('search')?.toLowerCase().replace('#', '');
  if (s) list = list.filter((o) => String(o.id).includes(s) || (o.customerName ?? '').toLowerCase().includes(s));
  return [...list].sort((a, b) => b.id - a.id);
}

function productFromBody(b: any, id: number): MockProduct {
  const fields: ApiFieldError[] = [];
  if (!b.name?.trim()) fields.push({ field: 'name', message: 'Nome é obrigatório' });
  if (!(b.price > 0)) fields.push({ field: 'price', message: 'Preço deve ser maior que zero' });
  if (!(b.stock >= 0)) fields.push({ field: 'stock', message: 'Estoque não pode ser negativo' });
  const category = CATEGORIES.find((c) => c.id === Number(b.categoryId));
  if (!category) fields.push({ field: 'categoryId', message: 'Categoria é obrigatória' });
  if (fields.length) throw new ApiErr(400, 'Dados inválidos', fields);
  return {
    id, name: b.name.trim(), description: b.description ?? '', price: Number(b.price), originalPrice: b.originalPrice ? Number(b.originalPrice) : null,
    stock: Number(b.stock), imageUrl: b.imageUrl || null, active: b.active !== false, category: { id: category!.id, name: category!.name },
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

const routes: [string, RegExp, Handler][] = [
  ['GET', /^\/store-info$/, () => ({ freeShippingThreshold: 199, shippingFee: 15, maxInstallments: 10, returnDays: 7 })],
  ['GET', /^\/categories$/, () => CATEGORIES.map((c) => ({ ...c, productCount: PRODUCTS.filter((p) => p.active && p.category.id === c.id).length }))],
  ['GET', /^\/products$/, (c) => paginate(filterProducts(PRODUCTS.filter((p) => p.active), c.q), c.q)],
  ['GET', /^\/products\/(\d+)$/, (c) => { const p = need(byId(+c.m[1])); if (!p.active) throw new ApiErr(404, 'Produto indisponível'); return p; }],

  ['POST', /^\/auth\/login$/, (c) => {
    if (!c.body.email || (c.body.password ?? '').length < 3) throw new ApiErr(401, 'E-mail ou senha inválidos');
    return session(c.body.email);
  }],
  ['POST', /^\/auth\/register$/, (c) => {
    if (c.body.email === 'existe@email.com') throw new ApiErr(409, 'Este e-mail já está cadastrado');
    return session(c.body.email, c.body.name);
  }],
  ['GET', /^\/users\/me$/, (c) => ({ ...need(c.user), address: DEFAULT_ADDRESS })],

  ['POST', /^\/orders$/, (c) => {
    const b = c.body as CreateOrderRequest;
    const items = b.items.map((i) => {
      const p = need(byId(i.productId), 'Produto não encontrado');
      if (p.stock < i.quantity) throw new ApiErr(422, `Estoque insuficiente para ${shortName(p)}`);
      return { p, quantity: i.quantity };
    });
    items.forEach(({ p, quantity }) => (p.stock -= quantity));
    const subtotal = items.reduce((s, { p, quantity }) => s + p.price * quantity, 0);
    const shipping = subtotal >= 199 ? 0 : 15;
    const order: MockOrder = {
      id: takeOrderId(), status: 'PENDING', createdAt: new Date().toISOString().slice(0, 10), subtotal, shipping, total: subtotal + shipping,
      items: items.map(({ p, quantity }) => ({ productId: p.id, name: shortName(p), imageUrl: p.imageUrl, quantity, unitPrice: p.price })),
      paymentMethod: b.paymentMethod, address: b.address, customerName: c.user?.name ?? 'Cliente', mine: true,
    };
    ORDERS.unshift(order);
    return order;
  }],
  ['GET', /^\/orders\/me$/, (c) => paginate(filterOrders(ORDERS.filter((o) => o.mine), c.q), c.q, 10)],
  ['GET', /^\/orders\/(\d+)$/, (c) => need(ORDERS.find((o) => o.id === +c.m[1] && o.mine))],
  ['PATCH', /^\/orders\/(\d+)\/cancel$/, (c) => {
    const o = need(ORDERS.find((x) => x.id === +c.m[1] && x.mine));
    if (o.status !== 'PENDING') throw new ApiErr(409, 'Só pedidos pendentes podem ser cancelados');
    o.status = 'CANCELED';
    return o;
  }],

  ['GET', /^\/admin\/products$/, (c) => {
    let list = filterProducts(PRODUCTS, c.q);
    const st = c.q.get('status');
    if (st === 'active') list = list.filter((p) => p.active && p.stock > 0);
    if (st === 'inactive') list = list.filter((p) => !p.active);
    if (st === 'out') list = list.filter((p) => p.active && p.stock === 0);
    return paginate(list, c.q, 6);
  }],
  ['GET', /^\/admin\/products\/(\d+)$/, (c) => need(byId(+c.m[1]))],
  ['POST', /^\/admin\/products$/, (c) => { const p = productFromBody(c.body, Math.max(...PRODUCTS.map((x) => x.id)) + 1); PRODUCTS.push(p); return p; }],
  ['PUT', /^\/admin\/products\/(\d+)$/, (c) => {
    const i = PRODUCTS.findIndex((p) => p.id === +c.m[1]); need(i >= 0 ? true : null);
    return (PRODUCTS[i] = { ...productFromBody(c.body, +c.m[1]), createdAt: PRODUCTS[i].createdAt });
  }],
  ['DELETE', /^\/admin\/products\/(\d+)$/, (c) => { need(byId(+c.m[1])).active = false; return null; }], // soft delete

  ['GET', /^\/admin\/orders$/, (c) => paginate(filterOrders(ORDERS, c.q), c.q, 5)],
  ['GET', /^\/admin\/orders\/summary$/, () => {
    const n = (s: OrderStatus) => ORDERS.filter((o) => o.status === s).length;
    return { pending: 5 + n('PENDING'), paid: 10 + n('PAID'), shipped: 7 + n('SHIPPED'), monthRevenue: 4870 };
  }],
  ['GET', /^\/admin\/orders\/(\d+)$/, (c) => need(ORDERS.find((o) => o.id === +c.m[1]))],
  ['PATCH', /^\/admin\/orders\/(\d+)\/status$/, (c) => {
    const o = need(ORDERS.find((x) => x.id === +c.m[1]));
    if (!nextStatuses(o.status).includes(c.body.status)) throw new ApiErr(409, `Transição inválida: ${o.status} → ${c.body.status}`);
    o.status = c.body.status;
    return o;
  }],
];

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMock || !req.url.startsWith(environment.apiUrl)) return next(req);
  const path = req.url.slice(environment.apiUrl.length).split('?')[0];

  let user: AuthUser | null = null;
  try { user = JSON.parse(decodeURIComponent((req.headers.get('Authorization') ?? '').replace('Bearer mock.', ''))); } catch { /* anônimo */ }

  return timer(220).pipe(mergeMap(() => {
    try {
      for (const [method, re, handler] of routes) {
        const m = req.method === method ? re.exec(path) : null;
        if (m) return of(new HttpResponse({ status: 200, body: handler({ q: req.params, m, body: req.body, user }) }));
      }
      throw new ApiErr(404, `Mock sem rota para ${req.method} ${path}`);
    } catch (e) {
      if (!(e instanceof ApiErr)) throw e;
      return throwError(() => new HttpErrorResponse({
        status: e.status, url: req.url, error: { status: e.status, error: 'Erro', message: e.message, fields: e.fields },
      }));
    }
  }));
};
