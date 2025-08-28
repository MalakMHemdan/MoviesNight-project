const fs = require('fs');
const path = require('path');

const PAGE_SIZE = parseInt(process.env.PAGE_SIZE || '10', 10);

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

function escReg(s='') { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

exports.list = async (req, res) => {
  try {
    const {
      page = 1,
      q,
      title,
      year,
      yearFrom,
      yearTo,
      genre,
      type,
      minRating,
      maxRating,
      director,
      actor,
      sort
    } = req.query;

    let filteredMovies = [...moviesData];

    // title search
    if (q) {
      const regex = new RegExp(escReg(q), 'i');
      filteredMovies = filteredMovies.filter(movie => regex.test(movie.title.primary));
    }
    if (title && !q) {
      const regex = new RegExp(escReg(title), 'i');
      filteredMovies = filteredMovies.filter(movie => regex.test(movie.title.primary));
    }

    // year filtering
    if (year) {
      filteredMovies = filteredMovies.filter(movie => movie.year.start === parseInt(year));
    }
    if (yearFrom) {
      filteredMovies = filteredMovies.filter(movie => movie.year.start >= parseInt(yearFrom));
    }
    if (yearTo) {
      filteredMovies = filteredMovies.filter(movie => movie.year.start <= parseInt(yearTo));
    }

    // genre filtering
    if (genre) {
      const genres = String(genre).split(',').map(s => s.trim());
      filteredMovies = filteredMovies.filter(movie => 
        movie.genres.some(g => genres.includes(g))
      );
    }

    // rating filtering
    if (minRating) {
      filteredMovies = filteredMovies.filter(movie => movie.rating.percent >= parseFloat(minRating));
    }
    if (maxRating) {
      filteredMovies = filteredMovies.filter(movie => movie.rating.percent <= parseFloat(maxRating));
    }

    // director filtering
    if (director) {
      const regex = new RegExp(escReg(director), 'i');
      filteredMovies = filteredMovies.filter(movie => 
        movie.crew.directors.some(d => regex.test(d.name))
      );
    }

    // sorting
    const sortMap = {
      'rating_desc': (a, b) => b.rating.percent - a.rating.percent,
      'rating_asc': (a, b) => a.rating.percent - b.rating.percent,
      'year_desc': (a, b) => b.year.start - a.year.start,
      'year_asc': (a, b) => a.year.start - b.year.start,
      'title_asc': (a, b) => a.title.primary.localeCompare(b.title.primary),
      'title_desc': (a, b) => b.title.primary.localeCompare(a.title.primary)
    };
    
    if (sortMap[sort]) {
      filteredMovies.sort(sortMap[sort]);
    } else {
      // Default sort: rating desc, then year desc
      filteredMovies.sort((a, b) => {
        if (b.rating.percent !== a.rating.percent) {
          return b.rating.percent - a.rating.percent;
        }
        return b.year.start - a.year.start;
      });
    }

    const total = filteredMovies.length;
    const p = Math.max(parseInt(page) || 1, 1);
    const skip = (p - 1) * PAGE_SIZE;
    const items = filteredMovies.slice(skip, skip + PAGE_SIZE);

    res.json({ 
      page: p, 
      pageSize: PAGE_SIZE, 
      totalPages: Math.ceil(total / PAGE_SIZE), 
      totalItems: total, 
      items 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = req.params.tconst;
    const doc = moviesData.find(movie => movie.tconst === id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
