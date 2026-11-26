import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { StoreInfo } from '../../shared/models/store-info';

@Injectable({ providedIn: 'root' })
export class StoreInfoApi {
  private readonly http = inject(HttpClient);
  get() { return this.http.get<StoreInfo>(`${environment.apiUrl}/store-info`); }
}
