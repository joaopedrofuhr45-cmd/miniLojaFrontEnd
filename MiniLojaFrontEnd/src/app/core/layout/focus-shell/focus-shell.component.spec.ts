import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FocusShellComponent } from './focus-shell.component';

describe('FocusShellComponent', () => {
  let fixture: ComponentFixture<FocusShellComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [FocusShellComponent],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(FocusShellComponent);
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
