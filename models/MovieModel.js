// defining the movies schema 

const mongoose = require("mongoose");
const mediaSchema = new mongoose.Schema({
  
  title: { type: String, required: true },
  synopsis: String,
  genre: String,
  rating: Number,
  smallPoster: String,
  largePoster: String,
  trailerLink: String,
  priceperday: Number,
  isMovie: Boolean,
  isFeatured: Boolean,
});



module.exports = mongoose.model("Media", mediaSchema);

