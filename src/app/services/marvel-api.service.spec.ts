import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MarvelApiService } from './marvel-api.service';
import { environment } from 'src/env/environment';

describe('MarvelApiService', () => {
  let service: MarvelApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MarvelApiService],
    });
    service = TestBed.inject(MarvelApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should have the correct auth params', () => {
    const authParams = service['getAuthParams']();
    expect(authParams.keys()).toEqual(['apikey', 'ts', 'hash']);
    expect(authParams.get('apikey')).toEqual(environment.marvelPublicKey);
  });

  it('should build the correct URL with auth params', () => {
    const endpoint = '/characters';
    const authParams = service['getAuthParams']();
    const url = service['buildUrl'](endpoint, authParams);
    expect(url).toEqual(`${environment.marvelUrl}${endpoint}?${authParams.toString()}`);
  });

  it('should return empty characters and total 0 on API error', () => {
    service.getCharacters().subscribe((response) => {
      expect(response.characters.length).toBe(0);
      expect(response.total).toBe(0);
    });

    const req = httpTestingController.expectOne((req) => req.url.startsWith(`${environment.marvelUrl}/characters`));
    req.flush({ error: 'Error fetching characters' }, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should return characters and total correctly on valid API response', () => {
    const mockApiResponse = {
      data: {
        results: [
          {
            id: 1,
            name: 'Character 1',
            description: 'Description 1',
            thumbnail: {
              path: 'path1',
              extension: 'ext1',
            },
          },
        ],
        total: 1,
      },
    };

    service.getCharacters().subscribe((response) => {
      expect(response.characters.length).toBe(1);
      expect(response.total).toBe(1);
    });

    const req = httpTestingController.expectOne((req) => req.url.startsWith(`${environment.marvelUrl}/characters`));
    req.flush(mockApiResponse);
  });

  it('should return total characters correctly on valid API response', () => {
    const mockApiResponse = {
      data: {
        total: 100,
      },
    };

    service.getTotalCharacters().subscribe((total) => {
      expect(total).toBe(100);
    });

    const req = httpTestingController.expectOne((req) => req.url.startsWith(`${environment.marvelUrl}/characters`));
    req.flush(mockApiResponse);
  });

  it('should return 0 total characters on API error', () => {
    service.getTotalCharacters().subscribe((total) => {
      expect(total).toBe(0);
    });

    const req = httpTestingController.expectOne((req) => req.url.startsWith(`${environment.marvelUrl}/characters`));
    req.flush({ error: 'Error fetching total characters' }, { status: 500, statusText: 'Internal Server Error' });
  });
});

