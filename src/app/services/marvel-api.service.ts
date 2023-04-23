import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { Character } from '../models/character';
import { environment } from 'src/env/environment';

interface ApiResponse {
  data: {
    results: any[];
    total: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MarvelApiService {
  constructor(private http: HttpClient) {}

  private getAuthParams(): HttpParams {
    const privateKey = environment.marvelPrivateKey;
    const ts = new Date().getTime().toString();
    const hash = CryptoJS.MD5(ts + privateKey + environment.marvelPublicKey).toString();

    return new HttpParams()
      .set('apikey', environment.marvelPublicKey)
      .set('ts', ts)
      .set('hash', hash);
  }

  private buildUrl(endpoint: string, params: HttpParams): string {
    return `${environment.marvelUrl}${endpoint}?${params.toString()}`;
  }

  getCharacters(offset = 0, limit = 20, nameStartsWith?: string): Observable<{ characters: Character[]; total: number }> {
    let params = this.getAuthParams().set('offset', offset.toString()).set('limit', limit.toString());

    if (nameStartsWith) {
      params = params.set('nameStartsWith', nameStartsWith);
    }

    const url = this.buildUrl('/characters', params);

    return this.http.get<ApiResponse>(url).pipe(
      map((response) => {
        return {
          characters: response.data.results.map((characterData) => {
            return {
              id: characterData.id,
              name: characterData.name,
              description: characterData.description,
              thumbnail: `${characterData.thumbnail.path}.${characterData.thumbnail.extension}`,
            };
          }),
          total: response.data.total,
        };
      }),
      catchError((error) => {
        console.error('Error fetching characters:', error);
        return of({ characters: [], total: 0 });
      })
    );
  }

  getTotalCharacters(): Observable<number> {
    const url = this.buildUrl('/characters', this.getAuthParams());

    return this.http
      .get<ApiResponse>(url)
      .pipe(
        map((response) => response.data.total),
        catchError((error) => {
          console.error('Error fetching total characters:', error);
          return of(0);
        })
      );
  }
}
