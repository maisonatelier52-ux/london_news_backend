
// // models/Category.js
// const mongoose = require('mongoose');

// const categorySchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, unique: true },
//     slug: { type: String, required: true, unique: true },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Category', categorySchema);

// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    bannerImage: { type: String, default: '' }, // New field for banner image
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);   