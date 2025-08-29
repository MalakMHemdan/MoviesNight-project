import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private baseUrl = 'http://localhost:5003/api';

  constructor(private http: HttpClient) {}

  // Get movies with pagination and filters
  getMovies(params: any = {}): Observable<any> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.q) queryParams.append('q', params.q);
    if (params.genre) queryParams.append('genre', params.genre);
    if (params.year) queryParams.append('year', params.year.toString());
    if (params.minRating) queryParams.append('minRating', params.minRating.toString());
    if (params.maxRating) queryParams.append('maxRating', params.maxRating.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    
    const url = `${this.baseUrl}/movies${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.http.get(url);
  }

  // Get trending movies (using the movies API with default sorting)
  getTrendingMovies(page: number = 1): Observable<any> {
    return this.getMovies({ page, sort: 'rating_desc' });
  }

  // Get recommended movies (high rated movies)
  getRecommendedMovies(): Observable<any> {
    // Dataset ratings are 0–10, so use 8 as a high-rating threshold
    return this.getMovies({ page: 1, sort: 'rating_desc', minRating: 8 });
  }

  // Get movie details by IMDb ID
  getMovieDetails(movieId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/movies/${movieId}`);
  }

  // Search movies by title
  searchMovies(query: string, page: number = 1): Observable<any> {
    return this.getMovies({ q: query, page });
  }

  // Get movies by genre
  getMoviesByGenre(genre: string, page: number = 1): Observable<any> {
    return this.getMovies({ genre, page });
  }

  // Get movie recommendations (similar movies by genre)
  getMovieRecommendations(movieId: string): Observable<any> {
    // First get the movie details to find its genre
    return this.getMovieDetails(movieId);
  }
}
