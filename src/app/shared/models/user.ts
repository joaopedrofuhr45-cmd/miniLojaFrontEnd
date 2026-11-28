export type Role = 'USER' | 'ADMIN';

export interface AuthUser { id: number; name: string; email: string; role: Role; }
export interface AuthResponse { token: string; user: AuthUser; }

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

export interface UserProfile extends AuthUser { address: Address | null; }
