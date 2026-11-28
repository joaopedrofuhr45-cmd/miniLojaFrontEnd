import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApiError } from '../../shared/models/api-error';

const MESSAGES: Record<string, string> = {
  required: 'Campo obrigatório', email: 'E-mail inválido', minlength: 'Mínimo de 8 caracteres', mismatch: 'As senhas não conferem',
};

export const authMessage = (code: string): string => MESSAGES[code] ?? 'Valor inválido';

/** Mensagem do primeiro erro de um campo (só depois de tocado); erro vindo do back tem prioridade. */
export function fieldError(form: FormGroup, name: string): string {
  const c = form.controls[name];
  if (!c || !c.touched || !c.errors) return '';
  return c.errors['server'] ?? authMessage(Object.keys(c.errors)[0]);
}

/** Só aceita caminho interno (evita open redirect via ?returnUrl=//site-malicioso). */
export function safeReturnUrl(back: string | null): string {
  return back && back.startsWith('/') && !back.startsWith('//') ? back : '/catalogo';
}

/** Joga os erros de campo do back no formulário e devolve a mensagem geral. */
export function applyServerError(e: HttpErrorResponse, form: FormGroup, fallback: string): string {
  const api = e.error as Partial<ApiError> | null;
  api?.fields?.forEach((f) => form.controls[f.field]?.setErrors({ server: f.message }));
  form.markAllAsTouched();
  if (e.status === 0) return 'Sem conexão com o servidor. Tente de novo.';
  if (e.status >= 500) return 'Algo deu errado do nosso lado. Tente de novo.';
  return api?.message ?? fallback;
}

export type ErrorSignal = ReturnType<typeof signal<string>>;
