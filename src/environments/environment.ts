/** Em dev, `/api` passa pelo proxy.conf.json e vai para o Spring Boot em http://localhost:8080 (sem CORS). */
export const environment = {
  production: false,
  apiUrl: '/api',
  /** Só em dev: usuário e dados (produtos, categorias) fictícios, sem backend. Ponha `false` para usar o Spring Boot de verdade. */
  mock: true,
};
