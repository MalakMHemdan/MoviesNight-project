import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface WishlistItem {
  tconst: string;
  title: { primary: string };
  poster?: string;
  rating?: { percent: number };
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private baseUrl = 'http://localhost:5003/api/wishlist';
  private wishlistSubject = new BehaviorSubject<WishlistItem[]>([]);

  wishlist$ = this.wishlistSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadWishlist();
  }

  // Load wishlist from backend
  loadWishlist(): Observable<any> {
    return this.http.get(this.baseUrl).pipe(
      tap((response: any) => {
        if (response.status === 'success') {
          this.wishlistSubject.next(response.data.movies || []);
        }
      })
    );
  }

  // Get all wishlist items
  getAll(): WishlistItem[] {
    return this.wishlistSubject.value;
  }

  // Check if movie is in wishlist
  isInWishlist(tconst: string): boolean {
    return this.wishlistSubject.value.some(item => item.tconst === tconst);
  }

  // Add movie to wishlist
  add(tconst: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${tconst}`, {}).pipe(
      tap(() => {
        this.loadWishlist().subscribe();
      })
    );
  }

  // Remove movie from wishlist
  remove(tconst: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${tconst}`).pipe(
      tap(() => {
        this.loadWishlist().subscribe();
      })
    );
  }

  // Toggle movie in wishlist
  toggle(tconst: string): Observable<any> {
    if (this.isInWishlist(tconst)) {
      return this.remove(tconst);
    } else {
      return this.add(tconst);
    }
  }
} 