import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('page', 1);
    fixture.componentRef.setInput('totalPages', 3);
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('emite pageChange ao clicar em outra página', () => {
    let page = 0;
    fixture.componentInstance.pageChange.subscribe((p) => (page = p));
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    buttons.find((b) => b.textContent?.trim() === '2')!.click();
    expect(page).toBe(2);
  });

  it('não renderiza com uma página só', () => {
    fixture.componentRef.setInput('totalPages', 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });
});
