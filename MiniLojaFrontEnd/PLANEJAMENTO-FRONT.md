# MiniLoja — Planejamento do Front-end

> **Angular** (standalone components + signals) consumindo a API **Java / Spring Boot** descrita em [`PLANEJAMENTO-BACK.md`](PLANEJAMENTO-BACK.md).
> O produto vendido ainda não foi definido: o modelo é genérico (`Product` com nome, descrição, preço, estoque, imagem e categoria), então trocar o produto depois só muda os dados, não a arquitetura.

---

## 1. Visão geral (fluxo)

```
Usuário
  │
  ▼
Angular (SPA)
  ├─ pages        → telas (rotas, lazy load por feature)
  ├─ components   → pedaços reutilizáveis da tela
  ├─ services     → 1 por feature (ProductsApi, OrdersApi...) ── HttpClient ──┐
  ├─ stores       → AuthStore, CartStore (signals)                             │
  └─ interceptors → auth (Bearer token) · error (401/500)                      ▼
                                                    Spring Boot  /api/*  ──►  PostgreSQL
```

**Fluxo de compra (o caminho principal):**

```
Catálogo → Detalhe → Carrinho → (login, se precisar) → Checkout → Pedido criado → Meus pedidos
   │           │         │                                  │
   └ GET /products       └ só no front (localStorage)       └ POST /orders (único momento em que o carrinho vira dado no back)
```

---

## 2. Stack e decisões

| Item | Escolha | Por quê |
|---|---|---|
| Framework | Angular, standalone components, `@if` / `@for` | Sem NgModules, menos boilerplate |
| Estado | **Signals** (`signal`, `computed`, `effect`) | Suficiente pro MVP, sem NgRx |
| HTTP | `HttpClient` + interceptors funcionais | Padrão atual do Angular |
| Formulários | Reactive Forms | Validação clara em login, checkout e admin |
| Estilo | SCSS + CSS variables (tokens da seção 8) | Sem lib de UI: leve e combina com os wireframes |
| Rotas | Lazy loading por feature (`loadChildren`) | Bundle inicial pequeno |
| Carrinho | **Só no front** (signal + `localStorage`) | Mais simples; o back revalida preço e estoque no pedido |
| Token JWT | `localStorage` | Simples pro portfólio. Trade-off: exposto a XSS; alternativa futura é cookie `httpOnly` |

---

## 3. Telas

Cada imagem mostra, na barra escura inferior, o que a tela consome da API.

### 3.0 Home — `/` (público)

<img src="docs/telas/00-home.png" alt="Home" width="760">

- Faixa fina no topo (frete grátis, parcelas), header com a **busca como centro da tela**, menu de categorias, banner, faixa de confiança, categorias em círculos e duas vitrines (ofertas e lançamentos).
- Os textos de frete grátis e parcelas vêm de `GET /api/store-info`, para não ficarem fixos no código do front.
- API: `GET /api/products?onSale=true&size=4`, `GET /api/products?sort=newest&size=4`, `GET /api/categories`, `GET /api/store-info`.

### 3.1 Catálogo — `/catalogo` (público)

<img src="docs/telas/01-catalogo.png" alt="Catálogo" width="760">

- Sidebar de filtros (categoria, faixa de preço, "somente com desconto"), chips removíveis dos filtros ativos, ordenação e paginação. Grid de **4 colunas**.
- Filtros viram **query params** da URL (`?categoria=2&ate=100&ordem=relevantes&page=1`), então dá pra compartilhar e o botão voltar funciona.
- **Card de produto** (`product-card`): imagem quadrada, selo `% OFF`, favorito, título em até 2 linhas, preço antigo riscado, preço atual, "em Nx sem juros" e botão Adicionar. Dá pra decidir sem abrir o produto.
- Botão **Adicionar** chama `CartStore.add()`, sem request. O coração (favoritos) é só visual no MVP.
- API: `GET /api/products`, `GET /api/categories`.

### 3.2 Detalhe do produto — `/produtos/:id` (público)

<img src="docs/telas/02-detalhe-produto.png" alt="Detalhe do produto" width="760">

- Duas colunas (≈60/40): galeria + descrição à esquerda, **caixa de compra** à direita.
- Caixa de compra: preço antigo riscado, preço, `% OFF`, parcelas, regra de frete, estoque, quantidade (máximo = estoque), **Comprar agora** (botão laranja: adiciona ao carrinho e vai para `/checkout`) e **Adicionar ao carrinho** (secundário).
- O campo de CEP é **visual no MVP**; a mensagem de frete vem de `GET /api/store-info`. Cálculo real por CEP fica para a v2.
- API: `GET /api/products/{id}`, `GET /api/products?category={id}&size=4`, `GET /api/store-info`.

### 3.3 Carrinho — `/carrinho` (público)

<img src="docs/telas/03-carrinho.png" alt="Carrinho" width="760">

- Lista de itens (quantidade, remover, favoritar), barra de frete grátis e card de resumo com total e parcelas.
- Sem chamada de pedido: tudo vem do `CartStore`. O frete exibido é calculado no front só pra mostrar (`subtotal >= freeShippingThreshold ? 0 : shippingFee`, valores de `store-info`). O back recalcula no pedido.
- "Continuar a compra" sem login → redireciona para `/entrar?returnUrl=/checkout`.

### 3.4 Checkout — `/checkout` (`authGuard`)

<img src="docs/telas/04-checkout.png" alt="Checkout" width="760">

- Header enxuto (sem busca nem menu, pra não distrair) e indicador de etapas: Carrinho → Entrega e pagamento → Confirmação.
- Endereço (pré-preenchido com `GET /api/users/me`) e pagamento **simulado**.
- Confirmar → `POST /api/orders`. Sucesso: limpa o carrinho e navega para `/pedidos`. Erro 422 (estoque): mostra a mensagem do back e mantém o carrinho.
- Desabilitar o botão enquanto a request está em andamento (evita pedido duplicado).

### 3.5 Login / Cadastro — `/entrar` (`guestGuard`)

<img src="docs/telas/05-login-cadastro.png" alt="Login e cadastro" width="760">

- Uma página com duas abas (`?aba=cadastro`). No desktop dá pra mostrar lado a lado, no mobile vira abas.
- Sucesso: guarda `{ token, user }` no `AuthStore` e vai para `returnUrl` (ou `/catalogo`).
- API: `POST /api/auth/login`, `POST /api/auth/register`.

### 3.6 Meus pedidos — `/pedidos` (`authGuard`)

<img src="docs/telas/06-meus-pedidos.png" alt="Meus pedidos" width="760">

- Lista paginada, filtro por status, um card por pedido com miniaturas dos itens e **linha do tempo** (Pedido feito → Pago → Enviado → Entregue).
- Cancelar só aparece com status `PENDING`.
- API: `GET /api/orders/me`, `GET /api/orders/{id}`, `PATCH /api/orders/{id}/cancel`.

### 3.7 Admin — Produtos (lista) — `/admin/produtos` (`adminGuard`)

<img src="docs/telas/07-admin-produtos.png" alt="Admin: lista de produtos" width="760">

- Tabela com busca, filtros, editar e excluir (com modal de confirmação).
- "Excluir" no back é **soft delete** (`active = false`), por isso existe o status Inativo.
- API: `GET /api/admin/products`, `DELETE /api/admin/products/{id}`.

### 3.8 Admin — Formulário de produto — `/admin/produtos/novo` e `/admin/produtos/:id/editar`

<img src="docs/telas/08-admin-produto-form.png" alt="Admin: formulário de produto" width="760">

- Mesmo componente para criar e editar (se tem `:id`, carrega e faz `PUT`; senão `POST`).
- Validações: nome obrigatório, preço > 0, estoque ≥ 0, categoria obrigatória.
- MVP: imagem por **URL** (`imageUrl`). Upload de arquivo fica para a v2.
- API: `POST /api/admin/products`, `PUT /api/admin/products/{id}`, `GET /api/categories`.

### 3.9 Admin — Pedidos — `/admin/pedidos`

<img src="docs/telas/09-admin-pedidos.png" alt="Admin: pedidos" width="760">

- Cards de resumo no topo, lista com filtros e painel lateral do pedido selecionado.
- O select de status só oferece as transições válidas (fluxo na seção 6 do back).
- API: `GET /api/admin/orders`, `GET /api/admin/orders/summary`, `GET /api/admin/orders/{id}`, `PATCH /api/admin/orders/{id}/status`.

> **Itens do menu lateral sem tela no MVP:** Resumo (dashboard), Categorias e Usuários. Categorias é um CRUD igual ao de Produtos (o back já expõe os endpoints), então vira só copiar o padrão quando precisar.

---

## 4. Mapa de rotas

| Rota | Página | Acesso |
|---|---|---|
| `/` | HomePage | público |
| `/catalogo` | CatalogPage | público |
| `/produtos/:id` | ProductDetailPage | público |
| `/carrinho` | CartPage | público |
| `/entrar` | AuthPage | `guestGuard` (logado vai pro catálogo) |
| `/checkout` | CheckoutPage | `authGuard` |
| `/pedidos` | OrdersPage | `authGuard` |
| `/admin` | AdminShell (sidebar) | `adminGuard` |
| `/admin/produtos` | AdminProductsPage | `adminGuard` |
| `/admin/produtos/novo` | AdminProductFormPage | `adminGuard` |
| `/admin/produtos/:id/editar` | AdminProductFormPage | `adminGuard` |
| `/admin/pedidos` | AdminOrdersPage | `adminGuard` |
| `**` | NotFoundPage | público |

> Os guards são só **UX**. A segurança de verdade está no back (`hasRole("ADMIN")`).

---

## 5. Estrutura de pastas

```
src/
├─ environments/
│  ├─ environment.ts              # apiUrl: 'http://localhost:8080/api'
│  └─ environment.prod.ts
└─ app/
   ├─ app.config.ts               # provideRouter, provideHttpClient(withInterceptors([...]))
   ├─ app.routes.ts               # lazy load por feature
   │
   ├─ core/                       # singletons: carregam 1 vez
   │  ├─ interceptors/            # auth.interceptor.ts, error.interceptor.ts
   │  ├─ guards/                  # auth.guard.ts, guest.guard.ts, admin.guard.ts
   │  ├─ auth/                    # auth.store.ts, auth.api.ts
   │  ├─ store-info/              # store-info.api.ts, store-info.store.ts (frete grátis, parcelas)
   │  └─ layout/                  # shop-shell (header+footer), admin-shell (sidebar)
   │
   ├─ shared/                     # reutilizável, sem regra de negócio
   │  ├─ ui/                      # button, input, badge, modal, pagination, empty-state, spinner,
   │  │                            # product-card, price-block (usados em home, catálogo e detalhe)
   │  ├─ pipes/                   # brl.pipe.ts, order-status.pipe.ts
   │  └─ models/                  # page.ts, api-error.ts
   │
   └─ features/                   # 1 pasta por assunto do negócio
      ├─ home/
      │  ├─ pages/                # home.page.ts
      │  ├─ components/           # hero-banner, benefits-strip, category-shortcuts
      │  └─ home.routes.ts
      ├─ catalog/
      │  ├─ pages/                # catalog.page.ts, product-detail.page.ts
      │  ├─ components/           # product-filters, product-gallery, buy-box
      │  ├─ data/                 # products.api.ts, categories.api.ts
      │  ├─ models/               # product.ts, category.ts
      │  └─ catalog.routes.ts
      ├─ cart/
      │  ├─ pages/                # cart.page.ts
      │  ├─ components/           # cart-item-row, cart-summary
      │  ├─ cart.store.ts         # signals + localStorage
      │  └─ cart.routes.ts
      ├─ checkout/
      │  ├─ pages/                # checkout.page.ts
      │  ├─ components/           # address-form, payment-options, order-summary
      │  └─ checkout.routes.ts
      ├─ orders/
      │  ├─ pages/                # orders.page.ts
      │  ├─ components/           # order-card, order-status-badge
      │  ├─ data/                 # orders.api.ts
      │  ├─ models/               # order.ts
      │  └─ orders.routes.ts
      ├─ auth/
      │  ├─ pages/                # auth.page.ts (abas login / cadastro)
      │  └─ auth.routes.ts
      └─ admin/
         ├─ products/             # pages/, components/, data/admin-products.api.ts
         ├─ orders/               # pages/, components/, data/admin-orders.api.ts
         └─ admin.routes.ts
```

**Convenções de nome:** `*.page.ts` (rota), `*.api.ts` (HTTP), `*.store.ts` (estado), `*.guard.ts`, `*.interceptor.ts`.

---

## 6. Consumo de API

### 6.1 Base e ambientes

```ts
// environments/environment.ts
export const environment = { apiUrl: 'http://localhost:8080/api' };
```

CORS: o back libera `http://localhost:4200` (detalhe no `PLANEJAMENTO-BACK.md`). Alternativa: `proxy.conf.json` no `ng serve` apontando `/api` para `:8080`.

### 6.2 Interceptors

```ts
// core/interceptors/auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).token();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};

// core/interceptors/error.interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        router.navigate(['/entrar']);
      }
      return throwError(() => err); // a tela decide o que mostrar nos outros erros
    }),
  );
};

// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]));
```

### 6.3 Um service por feature

```ts
// features/catalog/data/products.api.ts
@Injectable({ providedIn: 'root' })
export class ProductsApi {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/products`;

  list(f: ProductFilters = {}) {
    let params = new HttpParams().set('page', f.page ?? 0).set('size', f.size ?? 12);
    if (f.search) params = params.set('search', f.search);
    if (f.category) params = params.set('category', f.category);
    if (f.minPrice != null) params = params.set('minPrice', f.minPrice);
    if (f.maxPrice != null) params = params.set('maxPrice', f.maxPrice);
    return this.http.get<Page<Product>>(this.url, { params });
  }

  get(id: number) {
    return this.http.get<Product>(`${this.url}/${id}`);
  }
}
```

### 6.4 Models (espelham os DTOs do back)

```ts
// shared/models/page.ts
export interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }

// features/catalog/models/product.ts
export interface Product {
  id: number; name: string; description: string;
  price: number; originalPrice: number | null; stock: number; imageUrl: string | null;
  active: boolean; category: { id: number; name: string };
}

// features/orders/models/order.ts
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
export type PaymentMethod = 'PIX' | 'CARD' | 'BOLETO';

export interface CreateOrderRequest {
  items: { productId: number; quantity: number }[];
  address: Address;
  paymentMethod: PaymentMethod;
}
```

### 6.5 Tratamento de erro na tela

O back responde erros num formato único (`status`, `error`, `message`, `fields`). A tela só precisa de:

| Status | O que fazer |
|---|---|
| 400 | Mostrar `fields[]` embaixo de cada input |
| 401 | Interceptor desloga e manda para `/entrar` |
| 403 | Tela "sem permissão" |
| 404 | Tela "não encontrado" |
| 409 / 422 | Mostrar `message` num aviso (ex.: "Estoque insuficiente para Produto 03") |
| 5xx | Mensagem genérica + botão "tentar de novo" |

Toda lista tem 3 estados desenhados: **carregando** (skeleton), **vazio** e **erro**.

---

## 7. Estado global (signals)

```ts
// features/cart/cart.store.ts
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly KEY = 'miniloja.cart';

  readonly items = signal<CartItem[]>(this.load());
  readonly count = computed(() => this.items().reduce((n, i) => n + i.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((s, i) => s + i.price * i.quantity, 0));

  constructor() {
    effect(() => localStorage.setItem(this.KEY, JSON.stringify(this.items())));
  }

  add(p: Product, qty = 1) {
    this.items.update(list => {
      const found = list.find(i => i.productId === p.id);
      if (found) {
        return list.map(i =>
          i.productId === p.id ? { ...i, quantity: Math.min(i.quantity + qty, p.stock) } : i);
      }
      return [...list, { productId: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, stock: p.stock, quantity: qty }];
    });
  }

  setQuantity(productId: number, quantity: number) { /* update + limite no estoque */ }
  remove(productId: number) { this.items.update(l => l.filter(i => i.productId !== productId)); }
  clear() { this.items.set([]); }

  private load(): CartItem[] {
    try { return JSON.parse(localStorage.getItem(this.KEY) ?? '[]'); } catch { return []; }
  }
}
```

**`AuthStore`:** `token`, `user`, `isLoggedIn` (computed), `isAdmin` (computed), `login()`, `logout()`. Persiste em `localStorage` e restaura ao iniciar.

> O preço guardado no carrinho é só pra exibir. No `POST /orders` o back ignora esse valor e recalcula com o preço atual do banco.

---

## 8. Design (direção visual)

**Referências, com o que foi e o que não foi verificado:** o visual segue padrões de marketplace e varejo brasileiro. Os padrões do Mercado Livre vieram de uma extração **não oficial** do design system dele ([designmd.app.br](https://designmd.app.br/brands/mercado-livre), que se declara sem afiliação e diz que alguns valores não foram conferidos no CSS original). O site do O Boticário não pôde ser aberto neste ambiente, então **nenhum token dele foi usado**; o que há de "varejo de beleza" (banner, categorias em círculos, faixa de benefícios) é padrão genérico do setor. **Paleta, logo e nome são próprios**: nada de amarelo/azul do Mercado Livre nem do verde do Boticário.

### Padrões adotados

| Padrão | Como aparece |
|---|---|
| Busca como centro do header | Pílula grande e centralizada, botão de lupa |
| Card denso | Preço antigo, preço, `% OFF`, parcelas e botão visíveis sem abrir o produto |
| Cor com função | **Verde** só para benefício ao comprador (frete grátis, desconto, sem juros). **Laranja** só para a ação principal de compra. **Verde-azulado** (marca) para o resto, inclusive botão secundário contornado |
| Grid | 4 colunas na lista; 2 colunas (≈60/40) no detalhe |
| Raio e sombra | Raios de 4–6px, sombra leve; a separação vem do fundo cinza × cartão branco |
| Checkout enxuto | Header sem busca/menu e indicador de etapas |
| Confiança | Faixa de benefícios na home, selos de compra segura e troca no detalhe, carrinho e checkout |

### Tokens

| Token | Valor | Uso |
|---|---|---|
| `--brand` | `#0B6E69` | Header, links, botão secundário, abas ativas |
| `--brand-dark` / `--brand-deep` | `#084F4B` / `#0B3F3C` | Faixa superior, sidebar do admin |
| `--brand-soft` | `#E6F4F3` | Fundo de chip/seleção |
| `--cta` / `--cta-hover` | `#C93D1B` / `#AD3416` | Comprar, Continuar, Confirmar, Salvar |
| `--accent` | `#F6C453` | Só no logotipo |
| `--ok` / `--ok-soft` | `#067A40` / `#E3F5EA` | Frete grátis, desconto, sem juros, status positivo |
| `--warn` / `--warn-soft` | `#8F5408` / `#FFF3CD` | Pendente, sem estoque |
| `--info` / `--info-soft` | `#1D4ED8` / `#E3EDFF` | Pago |
| `--danger` / `--danger-soft` | `#C62839` / `#FCE4E8` | Cancelado, excluir, erro |
| `--bg` | `#F2F2F2` | Fundo da página |
| `--ink` / `--ink2` / `--muted` | `#262626` / `#666666` / `#6B6B6B` | Texto principal / secundário / apoio |
| `--line` | `#E3E3E3` | Bordas |

**Contraste (WCAG, calculado):** texto branco sobre `--cta` = 5,0:1, sobre `--brand` = 6,1:1 e sobre `--ok` = 5,4:1; `--ok` sobre `--ok-soft` = 4,8:1; `--muted` sobre branco = 5,3:1 e sobre `--bg` = 4,8:1. Todos passam em AA (4,5:1) para texto normal. Os primeiros valores que testei (`#D9441F` e `#0A8F4E`) ficavam abaixo disso e foram escurecidos. Os tokens `--info`, `--danger` e `--warn` também passam sobre os respectivos fundos suaves.

### Tipografia, medidas e componentes

- **Fonte:** Inter (gratuita). As referências usam fontes próprias, que não dá pra reaproveitar.
- **Escala (px):** 12, 13, 14, 16, 18, 20, 24, 38. **Preço:** 24px (peso 500) no card, 38px (peso 400) no detalhe; preço antigo 13px riscado; título do card 14px em até 2 linhas.
- **Espaçamento:** 4, 8, 12, 16, 24, 32. **Container:** 1180px. **Breakpoints sugeridos:** 768 e 1200.
- **Cor do status do pedido:** `PENDING` → warn · `PAID` → info · `SHIPPED` → brand · `DELIVERED` → ok · `CANCELED` → danger. Centralizar no `order-status.pipe` + `order-status-badge`.
- **Componentes compartilhados:** `ui-button` (variantes `cta`, `outline`, `line`, `ghost`, `danger`), `ui-input`, `ui-badge`, `ui-modal`, `ui-pagination`, `ui-empty-state`, `ui-spinner`/skeleton, `product-card`, `price-block`, `order-timeline`.

Os wireframes são desktop. No mobile: grid 4 → 2 → 1 coluna, sidebar de filtros vira drawer, detalhe vira coluna única com a caixa de compra fixa no rodapé da tela, tabela do admin vira lista de cards, sidebar do admin vira menu recolhível.

---

## 9. Regras de arquitetura

1. `features/*` **não importam** umas das outras. Só `core` e `shared`. Se duas features precisam da mesma coisa, ela sobe pra `shared` ou `core`.
2. **Componente não chama `HttpClient`.** Quem chama é o `*.api.ts` (ou `*.store.ts`).
3. `shared` não tem regra de negócio, só UI e utilidades.
4. Valores em dinheiro: formatar com o `brl.pipe` (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`). Nunca somar preço no front pra **decidir** algo; o total oficial vem do back.
5. Tipos dos models acompanham os DTOs do back. Mudou o contrato lá, atualiza aqui.

---

## 10. Ordem de implementação

1. Criar o projeto, SCSS com os tokens, `environment.ts`, rotas vazias e os dois shells (loja e admin).
2. `shared/ui` básico: button, input, badge, spinner/skeleton, pagination.
3. `product-card` e `price-block` em `shared/ui`, depois **Catálogo** (lista + filtros) usando `ProductsApi` — comece com JSON mockado se o back ainda não existir.
4. **Detalhe do produto** + `CartStore` + botões Comprar agora / Adicionar. Em seguida a **Home** (reaproveita o `product-card`).
5. **Carrinho** (página + badge do header).
6. **Auth:** `AuthStore`, interceptors, guards, página de login/cadastro.
7. **Checkout** + `POST /orders` + redirecionamento para pedidos.
8. **Meus pedidos** (lista, detalhe expansível, cancelar).
9. **Admin:** lista de produtos → formulário → pedidos.
10. Responsividade, estados de erro/vazio, revisão de acessibilidade (labels, foco, contraste).

---

## 11. Fora do MVP (v2)

- Upload de imagem do produto · cálculo de frete por CEP / ViaCEP no checkout
- Pagamento real (Pix/cartão via gateway) · cupom de desconto · favoritos · avaliações
- Dashboard "Resumo" e telas de Categorias/Usuários no admin
- Carrinho sincronizado com o back (multi-dispositivo)
- Tema escuro · i18n
