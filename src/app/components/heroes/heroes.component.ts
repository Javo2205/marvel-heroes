import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, } from 'rxjs/operators';
import { Character } from 'src/app/models/character';
import { MarvelApiService } from 'src/app/services/marvel-api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroesComponent implements OnInit {
  characters$: BehaviorSubject<{ characters: Character[]; total: number }> = new BehaviorSubject<{ characters: Character[]; total: number }>({
    characters: [],
    total: 0,
  });
  searchForm: FormGroup;
  currentPage = 1;
  itemsPerPage = 20;
  totalPages = 1;
  totalCharacters = 0;

  selectedCharacter: Character = {
    description: '',
    id: 0,
    name: '',
    thumbnail: ''
  };

  heroesFound: boolean = true;
  modifiedCharacters: Map<number, Character> = new Map<number, Character>();
  deletedCharacters: Set<Character> = new Set<Character>();
  characterUpdates: { [id: number]: Partial<Character> } = {};


  constructor(private marvelApiService: MarvelApiService, private formBuilder: FormBuilder, private changeDetector: ChangeDetectorRef) {
    this.searchForm = this.formBuilder.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.searchForm.get('searchTerm')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.handleSearchFormChange());

    this.getCharacters();
  }

  getCharacters(): void {
    const offset = (this.currentPage - 1) * this.itemsPerPage;
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    this.marvelApiService.getCharacters(offset, this.itemsPerPage, searchTerm).subscribe(
      (response) => this.handleSuccess(response),
      (error) => this.handleError(error)
    );
  }

  handleSearchFormChange(): void {
    this.getCharacters();
  }

  handleSuccess(response: { characters: Character[]; total: number }): void {
    response.characters = response.characters
      .filter(character => ![...this.deletedCharacters].some(deleted => deleted.id === character.id)) // Filtrar personajes eliminados
      .map(character => {
        const update = this.characterUpdates[character.id];
        return update ? { ...character, ...update } : character;
      });
    this.characters$.next(response);
    this.totalPages = Math.ceil(response.total / this.itemsPerPage);

    this.heroesFound = response.characters.length > 0;

    if (response.total === 0) {
      this.characters$.next({
        characters: [],
        total: 0
      });
      this.totalPages = 0;
    } else if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
      this.getCharacters();
    }
  }

  handleError(error: any): void {
    console.error('Error fetching characters:', error);
    this.characters$.next({
      characters: [],
      total: 0
    });
    this.totalPages = 0;
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getCharacters();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getCharacters();
    }
  }

  showCharacterDetail(character: Character): void {
    this.selectedCharacter = character;
    Swal.fire({
      title: 'Character Details',
      html: `
        <p>Name: <input id="character-name" type="text" value="${character.name}"></p>
        <p>${character.description || 'No description available'}</p>
        <img src="${character.thumbnail}" alt="${character.name}" width="200" />
      `,
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: 'Delete',
      confirmButtonText: 'Save',
      preConfirm: () => {
        const newName = (document.getElementById('character-name') as HTMLInputElement).value;
        return { newName };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value) {
          this.updateCharacterName(this.selectedCharacter, result.value.newName);
        }
      } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
        this.deleteCharacter(this.selectedCharacter);
      }
      this.selectedCharacter = {
        description: '',
        id: 0,
        name: '',
        thumbnail: ''
      };
    });
  }


  updateCharacterName(character: Character, newName: string): void {
    this.characterUpdates[character.id] = {
      ...this.characterUpdates[character.id],
      name: newName
    };

    this.updateCharacters();
  }

  updateCharacters(): void {
    const charactersData = this.characters$.value;
    charactersData.characters = charactersData.characters.map(character => {
      const update = this.characterUpdates[character.id];
      return update ? { ...character, ...update } : character;
    });
    this.characters$.next(charactersData);
    this.changeDetector.markForCheck();
  }

  deleteCharacter(character: Character | null): void {
    if (character) {
      this.deletedCharacters.add(character);
      const charactersData = this.characters$.value;
      const index = charactersData.characters.findIndex(c => c.id === character.id);
      if (index !== -1) {
        charactersData.characters.splice(index, 1);
        charactersData.total -= 1;
        this.characters$.next(charactersData);
      }
    }
  }

}
