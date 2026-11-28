/** Em dev, `/api` passa pelo proxy.conf.json e vai para o Spring Boot em http://localhost:8080 (sem CORS). */
export const environment = {
  production: false,
  apiUrl: '/api',
  /** Só em dev: entra como um usuário fictício (sem backend) para ver a home logada. Ponha `false` para desligar. */
  mockUser: true,
};
