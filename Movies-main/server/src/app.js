require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { connect } = require('./db');
const movieRoutes = require('./routes/movies.routes');
const wishListRoutes = require('./routes/wishlist.routes');
const PORT = process.env.PORT || 5003;
const ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const path = require('path');

async function bootstrap() {
  await connect(process.env.MONGO_URI);

  const app = express();

  // ✅ هنا خلي الصور تتسرف من فولدر Images
app.use('/Images', express.static(path.join(__dirname, 'Images')));

  console.log("Serving Images from:", path.join(__dirname, 'src', 'Images'));

  app.use(helmet());
  app.use(compression());
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(cors({ 
    origin: (origin, cb) => {
      if (!origin || ORIGINS.length === 0 || ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    }
  }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api', movieRoutes);
  app.use('/api/wishlist', wishListRoutes);

  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

bootstrap();
