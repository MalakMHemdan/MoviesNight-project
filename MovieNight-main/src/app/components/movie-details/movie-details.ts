import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import { MovieService } from '../../services/movie';
import { WishlistService } from '../../services/wishlist';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [NgClass, DatePipe],
  templateUrl: './movie-details.html',
  styleUrl: './movie-details.css'
})
export class MovieDetails implements OnInit {
  movie: any = null;
  recommendations: any[] = [];
  loading = true;
  movieId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private wishlist: WishlistService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.movieId = params['id'];
      const slug = params['slug'];
      if (this.movieId) {
        this.loadMovieDetails();
        this.loadRecommendations();
      }
    });
  }

  loadMovieDetails() {
    this.loading = true;
    this.movieService.getMovieDetails(this.movieId).subscribe({
      next: (data: any) => {
        this.movie = data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching movie details:', error);
        this.loading = false;
      }
    });
  }

  loadRecommendations() {
    // For now, get similar movies by getting movies with high ratings
    this.movieService.getRecommendedMovies().subscribe({
      next: (data: any) => {
        this.recommendations = data.items?.slice(0, 6) || [];
      },
      error: (error: any) => {
        console.error('Error fetching recommendations:', error);
      }
    });
  }

  createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  goToMovieDetails(movieId: string) {
    if (movieId) {
      const movie = this.recommendations.find(m => m && m.tconst === movieId);
      if (movie && movie.title?.primary) {
        const slug = this.createSlug(movie.title.primary);
        this.router.navigate(['/movie', movieId, slug]);
      } else {
        this.router.navigate(['/movie', movieId]);
      }
    }
  }

  goBack() {
    this.router.navigate(['/trendify']);
  }

  toggleWishlist(movie: any) {
    if (movie && movie.tconst) {
      this.wishlist.toggle(movie.tconst).subscribe();
    }
  }

  isWishlisted(movie: any) {
    return movie && movie.tconst ? this.wishlist.isInWishlist(movie.tconst) : false;
  }


  getRuntimeFormatted(): string {
    if (!this.movie?.runtime) return '';
    const hours = Math.floor(this.movie.runtime / 60);
    const minutes = this.movie.runtime % 60;
    return `${hours}h ${minutes}m`;
  }

  onImgError(event: Event, type: 'movie' | 'rec' = 'movie') {
    const img = event.target as HTMLImageElement;
    if (type === 'movie') {
      img.src = 'https://via.placeholder.com/500x750/1a1a1a/fbbf24?text=No+Image';
    } else {
      img.src = 'https://via.placeholder.com/300x450/1a1a1a/fbbf24?text=No+Image';
    }
  }
}
