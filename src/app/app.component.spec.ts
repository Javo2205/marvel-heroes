import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HeroesComponent } from './characters/heroes/heroes.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      declarations: [AppComponent, HeroesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have a header with the title "List of Heroes"', () => {
    const header = fixture.debugElement.query(By.css('header'));
    const title = header.nativeElement.textContent.trim();
    expect(title).toBe('List of Heroes');
  });

  it('should render the app-heroes component', () => {
    const heroesComponent = fixture.debugElement.query(By.directive(HeroesComponent));
    expect(heroesComponent).toBeTruthy();
  });
});
