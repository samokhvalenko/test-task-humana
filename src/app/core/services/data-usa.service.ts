import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface DataUsaSearchItem {
  id: string;
  name: string;
  type: string;
  slug?: string;
}

export interface DataUsaSearchResponse {
  results: Array<{ id: string; name: string; type: string; slug?: string }>;
}

@Injectable({ providedIn: 'root' })
export class DataUsaService {
  private readonly http = inject(HttpClient);
  private readonly base = 'https://datausa.io/api';

  search(term: string, offset = 0, limit = 50): Observable<DataUsaSearchItem[]> {
    const url = `${this.base}/search/?q=${encodeURIComponent(term)}&offset=${offset}&limit=${limit}`;
    return this.http.get<DataUsaSearchResponse>(url).pipe(
      map((res: any) => {
        const arr: any[] = res?.results ?? [];
        return arr.map((r, idx) => ({
          id: String(r.id ?? `${r.type}-${r.name}-${offset + idx}`),
          name: String(r.name ?? ''),
          type: String(r.type ?? 'unknown'),
          slug: r.slug
        })) as DataUsaSearchItem[];
      })
    );
  }

  populationNation(): Observable<any> {
    const url = `${this.base}/data?drilldowns=Nation&measures=Population`;
    return this.http.get(url);
  }
}
