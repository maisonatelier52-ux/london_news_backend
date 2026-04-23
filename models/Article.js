
// models/Article.js
const mongoose = require('mongoose');

const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['paragraph', 'subheading', 'pullquote', 'image'],
    required: true,
  },
  text: { type: String },
  attribution: { type: String },
  src: { type: String },
  alt: { type: String },
  caption: { type: String },
});

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Article title is required'] },
    slug: {
      type: String,
      required: [true, 'Article slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    metaTitle: { type: String },
    metaDescription: { type: String },
    excerpt: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    newsType: {
      type: String,
      default: 'news',
      enum: ['news', 'client news', 'featured', 'opinion'],
    },
    type: {
      type: String,
      default: 'normal',
      enum: ['normal', 'featured', 'breaking', 'exclusive'],
    },
    date: { type: Date, default: Date.now },
    readTime: { type: String },
    isPublished: { type: Boolean, default: true },
    image: { type: String },
    imageAlt: { type: String },
    keywords: [{ type: String }],
    tags: [{ type: String }],
    content: [contentBlockSchema],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      default: null,
    },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Fixed pre-save: no 'next' parameter — just return a promise implicitly
articleSchema.pre('save', function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Article', articleSchema);