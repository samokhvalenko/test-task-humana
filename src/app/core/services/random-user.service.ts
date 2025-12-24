import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface RandomUserResponse {
  results: Array<{ picture: { large: string; medium: string; thumbnail: string } }>;
}

@Injectable({ providedIn: 'root' })
export class RandomUserService {
  private readonly http = inject(HttpClient);
  private readonly base = 'https://randomuser.me/api/';

  fetchImageBySeed(seed: string): Observable<{ large: string; medium: string; thumbnail: string }> {
    const url = `${this.base}?seed=${encodeURIComponent(seed)}&results=1&inc=picture`;
    return this.http.get<RandomUserResponse>(url).pipe(
      map(res => res.results?.[0]?.picture ?? { large: '', medium: '', thumbnail: '' })
    );
  }
}
