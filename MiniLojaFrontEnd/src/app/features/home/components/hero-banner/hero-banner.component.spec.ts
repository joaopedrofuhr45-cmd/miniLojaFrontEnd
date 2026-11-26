import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HeroBannerComponent } from './hero-banner.component';

describe('HeroBannerComponent', () => {
  let fixture: ComponentFixture<HeroBannerComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HeroBannerComponent],
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroBannerComponent);
    fixture.detectChanges();
  });

  it('deve renderizar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
