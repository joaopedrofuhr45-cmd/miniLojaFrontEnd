import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent],
  templateUrl: './not-found.page.html',
})
export class NotFoundPage {}
