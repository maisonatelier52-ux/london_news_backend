
// models/Footer.js
const mongoose = require('mongoose');

const footerLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String },
  externalUrl: { type: String },
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page' },
  pageTitle: { type: String },
  order: { type: Number, default: 0 },
}, { _id: false });

const footerSchema = new mongoose.Schema({
  siteDescription: { type: String, default: "Independent coverage of London politics, business, culture, lifestyle, technology and sport." },
  
  column1Title: { type: String, default: "Newsroom" },
  column1Links: [footerLinkSchema],
  
  column2Title: { type: String, default: "Standards" },
  column2Links: [footerLinkSchema],
  
  column3Title: { type: String, default: "Legal" },
  column3Links: [footerLinkSchema],
  
  column4Title: { type: String, default: "Get Involved" },
  column4Links: [footerLinkSchema],
  
  socialLinks: {
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    reddit: { type: String },
    telegram: { type: String },
    medium: { type: String },
    substack: { type: String },
  },
  
  copyrightText: { type: String, default: "© 2026 London News. All Rights Reserved." },
  backgroundImage: { type: String },
  
  newsletterTitle: { type: String, default: "Stay Ahead of London" },
  newsletterDescription: { type: String, default: "Get the latest London news delivered directly to your inbox." },
  newsletterButtonText: { type: String, default: "Subscribe" },
  newsletterSuccessText: { type: String, default: "Successfully subscribed! Check your inbox." },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Footer', footerSchema);