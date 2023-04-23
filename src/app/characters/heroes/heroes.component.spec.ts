import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MarvelApiService } from 'src/app/services/marvel-api.service';
import { HeroesComponent } from './heroes.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Character } from 'src/app/models/character';


describe('HeroesComponent', () => {
  let component: HeroesComponent;
  let fixture: ComponentFixture<HeroesComponent>;
  let marvelApiService: MarvelApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeroesComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [MarvelApiService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroesComponent);
    component = fixture.componentInstance;
    marvelApiService = TestBed.inject(MarvelApiService);
    fixture.detectChanges();
  });

  // Aquí van las pruebas
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('min() should return the minimum of two numbers', () => {
    const a = 5;
    const b = 10;
    expect(component.min(a, b)).toBe(5);
  });

  it('nextPage() should increment currentPage', () => {
    component.currentPage = 1;
    component.totalPages = 5;
    component.nextPage();
    expect(component.currentPage).toBe(2);
  });

  it('prevPage() should decrement currentPage', () => {
    component.currentPage = 5;
    component.prevPage();
    expect(component.currentPage).toBe(4);
  });
  it('getCharacters() should call MarvelApiService.getCharacters() with correct parameters', () => {
    const getCharactersSpy = spyOn(marvelApiService, 'getCharacters').and.returnValue(
      of({ characters: [], total: 0 })
    );

    component.itemsPerPage = 20;
    component.currentPage = 3;
    component.getCharacters();

    expect(getCharactersSpy).toHaveBeenCalledWith(40, 20, '');
  });
  it('ngOnInit() should initialize properties and call getCharacters()', () => {
    const getCharactersSpy = spyOn(component, 'getCharacters');
    component.ngOnInit();
    expect(component.searchForm).toBeDefined();
    expect(getCharactersSpy).toHaveBeenCalled();
  });

  it('handleSearchFormChange() should call getCharacters()', () => {
    const getCharactersSpy = spyOn(component, 'getCharacters');
    component.handleSearchFormChange();
    expect(getCharactersSpy).toHaveBeenCalled();
  });

  it('handleSuccess() should update component properties', () => {
    const response = {
      characters: [{ id: 1, name: 'Spider-Man', description: '...', thumbnail: '...' }],
      total: 1,
    };
    component.handleSuccess(response);
    expect(component.totalPages).toBe(1);
    expect(component.heroesFound).toBe(true);
  });

  it('handleError() should set component properties on error', () => {
    component.handleError('Error');
    expect(component.characters$.value).toEqual({ characters: [], total: 0 });
    expect(component.totalPages).toBe(0);
  });

  it('updateCharacterName() should update character name and call updateCharacters()', () => {
    const character: Character = {
      id: 1,
      name: 'Spider-Man',
      description: '...',
      thumbnail: '...',
    };
    const newName = 'Super Spider-Man';
    const updateCharactersSpy = spyOn(component, 'updateCharacters');
    component.updateCharacterName(character, newName);
    expect(component.characterUpdates[1].name).toBe(newName);
    expect(updateCharactersSpy).toHaveBeenCalled();
  });

  it('deleteCharacter() should remove character and update component properties', () => {
    const character: Character = {
      id: 1,
      name: 'Spider-Man',
      description: '...',
      thumbnail: '...',
    };
    component.characters$.next({ characters: [character], total: 1 });
    component.deleteCharacter(character);
    expect(component.deletedCharacters.has(character)).toBe(true);
    expect(component.characters$.value.characters.length).toBe(0);
    expect(component.characters$.value.total).toBe(0);
  });

});
