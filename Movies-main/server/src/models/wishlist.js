const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  movies: [{ type: String }] 
});
module.exports = mongoose.model('Wishlist', wishlistSchema);
