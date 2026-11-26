import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environment/environment';
import { Category } from '@shared/models/category';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  list() { return this.http.get<Category[]>(`${environment.apiUrl}/categories`); }
}
