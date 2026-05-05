

// // models/Category.js
// const mongoose = require('mongoose');

// const categorySchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, unique: true },
//     slug: { type: String, required: true, unique: true },
//     bannerImage: { type: String, default: '' }, // New field for banner image
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
    bannerImage: { type: String, default: '' },
    bannerImageAlt: { type: String, default: '' },
    description: { type: String, default: '' },
    position: { type: Number, default: 99 },
    isVisible: { type: Boolean, default: true },
    showInTopNav: { type: Boolean, default: true },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);