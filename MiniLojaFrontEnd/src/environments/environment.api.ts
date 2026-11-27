/** Modo "back real" no dev: `npm run start:api`. As chamadas vão para /api e o proxy.conf.json encaminha para o Spring Boot (:8080), sem CORS. */
export const environment = {
  production: false,
  apiUrl: '/api',
  useMock: false,
};
