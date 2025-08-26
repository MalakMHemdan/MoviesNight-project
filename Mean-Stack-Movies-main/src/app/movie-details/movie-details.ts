import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../services/movie';
import { WishlistService, WishlistItem } from '../services/wishlist';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-details.html',
  styleUrls: ['./movie-details.css'],
})
export class MovieDetailsComponent implements OnInit {
  movieId!: string;
  movie: any;
  recommendations: any[] = [];
  spokenLanguagesNames: string = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private wishlistService: WishlistService // ✅ أضفنا السيرفيس هنا
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.movieId = params['id'];
      this.getMovieDetails();
      this.getRecommendations();
    });
  }

  getMovieDetails(): void {
    this.movieService.getMovieDetails(this.movieId).subscribe((res) => {
      this.movie = res;

      if (this.movie.spoken_languages) {
        this.spokenLanguagesNames = this.movie.spoken_languages
          .map((l: any) => l.english_name)
          .join(', ');
      }
    });
  }

  getRecommendations(): void {
    this.movieService.getMovieRecommendations(this.movieId).subscribe((res) => {
      this.recommendations = res.results;
    });
  }

  toggleWishlist() {
    const item: WishlistItem = {
      id: this.movie.id,
      title: this.movie.title,
      poster_path: this.movie.poster_path,
      vote_average: this.movie.vote_average,
    };
    this.wishlistService.toggle(item);
  }

  isInWishlist(): boolean {
    return this.movie
      ? this.wishlistService.isInWishlist(this.movie.id)
      : false;
  }
}
