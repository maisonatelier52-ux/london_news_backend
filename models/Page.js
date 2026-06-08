// models/Page.js
const mongoose = require('mongoose');

// Block schema
const pageBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['hero', 'heading', 'paragraph', 'image', 'pullquote', 'list', 'faq', 'team', 'contact', 'pricing', 'cta', 'spacer', 'two_column'],
    required: true,
  },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  order: { type: Number, default: 0 },
}, { _id: true });

// Job listing schema for careers page
const jobSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  location: { type: String, default: '' },
  type: { type: String, default: 'Full-time' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { _id: true });

// Navigation link schema for policy pages
const navLinkSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { _id: false });

// Contact type schema for contact page
const contactTypeSchema = new mongoose.Schema({
  icon: { type: String, default: '📰' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { _id: true });

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    template: {
      type: String,
      enum: ['about', 'team', 'contact', 'policy', 'careers', 'custom', 'landing'],
      default: 'custom',
    },
    
    // SEO Fields
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    
    // Hero Section
    heroImage: { type: String, default: '' },
    heroImageAlt: { type: String, default: '' },
    heroTitle: { type: String, default: '' },
    heroSubtitle: { type: String, default: '' },
    
    // About Page Fields
    missionStatement: { type: String, default: '' },
    foundingDate: { type: String, default: '' },
    
    // Contact Page Fields
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactAddress: { type: String, default: '' },
    contactFormEnabled: { type: Boolean, default: true },
    contactFormTitle: { type: String, default: "Send Us a Message" },
    contactFormDescription: { type: String, default: "" },
    
    contactIntroTitle: { type: String, default: "Have a story tip, press inquiry, correction, or general question? We'd love to hear from you." },
    contactIntroText: { type: String, default: "Our newsroom is based in London and our journalists are working around the clock to bring you the news that matters across the capital." },
    
    contactOfficeTitle: { type: String, default: "Our Office" },
    contactOfficeAddress: { type: String, default: "London News\n1 London Bridge Street\nLondon, SE1 9GF\nUnited Kingdom" },
    
    contactEmailTitle: { type: String, default: "General Inquiries" },
    contactPhoneTitle: { type: String, default: "Phone" },
    contactHoursTitle: { type: String, default: "Newsroom Hours" },
    contactHoursText: { type: String, default: "24/7 — Our newsroom never sleeps.\nTips and messages are monitored around the clock." },
    
    contactTypesTitle: { type: String, default: "What You Can Contact Us About" },
    contactTypes: [contactTypeSchema],
    
    newsletterTitle: { type: String, default: "Stay Ahead of London" },
    newsletterDescription: { type: String, default: "Get the latest news, analysis, and stories delivered straight to your inbox." },
    newsletterButtonText: { type: String, default: "Subscribe" },
    newsletterSuccessText: { type: String, default: "Successfully subscribed! Check your inbox." },
    
    // Careers Page Fields
    jobsList: [jobSchema],
    
    // Policy Page Fields
    policyContent: { type: mongoose.Schema.Types.Mixed, default: {} },
    navLinks: [navLinkSchema],
    lastUpdated: { type: Date, default: Date.now },
    
    // Block content (for custom template)
    blocks: [pageBlockSchema],
    
    // Publishing Status
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-generate slug from title if not provided - FIXED VERSION
pageSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Page', pageSchema);