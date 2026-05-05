// // models/Homepage.js
// const mongoose = require('mongoose');

// const slotSchema = new mongoose.Schema({
//   articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', default: null },
//   titleOverride: { type: String, default: '' },
//   excerptOverride: { type: String, default: '' },
//   imageOverride: { type: String, default: '' },
//   kickerOverride: { type: String, default: '' },
// });

// const sectionSchema = new mongoose.Schema({
//   key: { type: String, required: true },
//   type: {
//     type: String,
//     enum: ['featured', 'headline', 'overlay', 'list', 'overlay_tall'],
//     default: 'overlay',
//   },
//   title: { type: String, default: '' },
//   limit: { type: Number, default: 3 },
//   order: { type: Number, default: 0 },
//   slots: { type: [slotSchema], default: [] },
// });

// const homepageSchema = new mongoose.Schema(
//   {
//     title: { type: String, default: 'Default Homepage' },
//     slug: { type: String, default: 'default' },
//     isActive: { type: Boolean, default: false },
//     seoTitle: { type: String, default: '' },
//     seoDescription: { type: String, default: '' },
//     seoImage: { type: String, default: '' },
//     sections: { type: [sectionSchema], default: [] },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Homepage', homepageSchema);

// models/Homepage.js
const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', default: null },
  titleOverride: { type: String, default: '' },
  excerptOverride: { type: String, default: '' },
  imageOverride: { type: String, default: '' },
  kickerOverride: { type: String, default: '' },
});

const sectionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  type: {
    type: String,
    enum: ['featured', 'headline', 'overlay', 'list', 'overlay_tall'],
    default: 'overlay',
  },
  title: { type: String, default: '' },
  limit: { type: Number, default: 3 },
  order: { type: Number, default: 0 },
  slots: { type: [slotSchema], default: [] },
});

const homepageSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    slug: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    sections: { type: [sectionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Homepage', homepageSchema);