const Wishlist = require('../models/wishlist');
const fs = require('fs');
const path = require('path');

// Load movies from JSON file
let moviesData = [];
try {
  const moviesPath = path.join(__dirname, '../../../movies.json');
  moviesData = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));
  
  // Transform data to match expected structure
  moviesData = moviesData.map(movie => ({
    tconst: movie.tconst,
    title: { primary: movie.title },
    year: { start: movie.year },
    genres: [movie.genre],
    rating: { percent: movie.rating },
    crew: {
      directors: [{ name: movie.director }]
    },
    poster: movie.poster?.replace('http://localhost:5003/Images/', '') || null
  }));
} catch (err) {
  console.error('Error loading movies data:', err);
}

// Get wishlist (all movies)
const getWishList = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne();

    if (!wishlist) {
      wishlist = await Wishlist.create({ movies: [] });
    }

    const movieDetails = moviesData.filter(movie => 
      wishlist.movies.includes(movie.tconst)
    );

    res.status(200).json({
      status: "success",
      data: {
        wishlist: wishlist.movies,
        movies: movieDetails
      }
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Add movie to wishlist
const addToWishList = async (req, res) => {
  try {
    const { id } = req.params;

    const movie = moviesData.find(m => m.tconst === id);
    if (!movie) {
      return res.status(404).json({ status: "fail", message: "Movie not found" });
    }

    let wishlist = await Wishlist.findOne();
    if (!wishlist) {
      wishlist = await Wishlist.create({ movies: [] });
    }

    if (!wishlist.movies.includes(id)) {
      wishlist.movies.push(id);
      await wishlist.save();
    }

    res.status(200).json({
      status: "success",
      message: "Movie added to wishlist",
      data: wishlist
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Remove movie from wishlist
const deleteFromWishList = async (req, res) => {
  try {
    const { id } = req.params;

    let wishlist = await Wishlist.findOne();
    if (!wishlist) {
      return res.status(404).json({ status: "fail", message: "Wishlist not found" });
    }

    wishlist.movies = wishlist.movies.filter(movieId => movieId !== id);
    await wishlist.save();

    res.status(200).json({
      status: "success",
      message: "Movie removed from wishlist",
      data: wishlist
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};


module.exports = {
  getWishList,
  addToWishList,
  deleteFromWishList
};
