// // routes/pages.js - CORRECTED VERSION (remove duplicate pre-save)
// const express = require('express');
// const router = express.Router();
// const adminVerify = require('../middlewares/adminVerify');
// const { uploadSingle, processImages } = require('../middlewares/imageUpload');
// const Page = require('../models/Page');
// const Activity = require('../models/Activity');

// // ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// // GET /api/pages — list all pages
// router.get('/', adminVerify, async (req, res) => {
//   try {
//     const { publishedOnly } = req.query;
//     let query = {};
    
//     if (publishedOnly === 'true') {
//       query.isPublished = true;
//     }
    
//     const pages = await Page.find(query).sort({ title: 1 });
//     res.json(pages);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/pages/:id — get single page
// router.get('/:id', adminVerify, async (req, res) => {
//   try {
//     const page = await Page.findById(req.params.id);
//     if (!page) return res.status(404).json({ message: 'Page not found.' });
//     res.json(page);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/pages — create new page
// router.post('/', adminVerify, uploadSingle, processImages, async (req, res) => {
//   try {
//     const pageData = JSON.parse(req.body.data || '{}');
    
//     if (!pageData.title?.trim()) {
//       return res.status(400).json({ message: 'Page title is required.' });
//     }
//     if (!pageData.slug?.trim()) {
//       return res.status(400).json({ message: 'Page slug is required.' });
//     }
    
//     // Check duplicate slug
//     const existing = await Page.findOne({ slug: pageData.slug.toLowerCase().trim() });
//     if (existing) {
//       return res.status(400).json({ message: `A page with slug "${pageData.slug}" already exists.` });
//     }
    
//     if (req.file?.savedPath) {
//       pageData.heroImage = req.file.savedPath;
//     }
    
//     const page = new Page(pageData);
//     await page.save();
//     await Activity.create({ action: 'Created page', title: page.title });
//     res.status(201).json(page);
//   } catch (err) {
//     console.error('Create page error:', err);
//     if (err.code === 11000) {
//       return res.status(400).json({ message: 'A page with this slug already exists.' });
//     }
//     res.status(500).json({ message: err.message });
//   }
// });

// // PUT /api/pages/:id — update page
// router.put('/:id', adminVerify, uploadSingle, processImages, async (req, res) => {
//   try {
//     const pageData = JSON.parse(req.body.data || '{}');
    
//     // Check duplicate slug (excluding current page)
//     if (pageData.slug?.trim()) {
//       const existing = await Page.findOne({
//         _id: { $ne: req.params.id },
//         slug: pageData.slug.toLowerCase().trim(),
//       });
//       if (existing) {
//         return res.status(400).json({ message: `A page with slug "${pageData.slug}" already exists.` });
//       }
//     }
    
//     if (req.file?.savedPath) {
//       pageData.heroImage = req.file.savedPath;
//     }
    
//     pageData.updatedAt = Date.now();
//     const page = await Page.findByIdAndUpdate(req.params.id, pageData, { new: true });
//     if (!page) return res.status(404).json({ message: 'Page not found.' });
    
//     await Activity.create({ action: 'Updated page', title: page.title });
//     res.json(page);
//   } catch (err) {
//     console.error('Update page error:', err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // DELETE /api/pages/:id — delete page
// router.delete('/:id', adminVerify, async (req, res) => {
//   try {
//     const page = await Page.findByIdAndDelete(req.params.id);
//     if (!page) return res.status(404).json({ message: 'Page not found.' });
//     await Activity.create({ action: 'Deleted page', title: page.title });
//     res.json({ message: 'Page deleted successfully.' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────

// // GET /api/pages/public/:slug — get published page by slug
// router.get('/public/:slug', async (req, res) => {
//   try {
//     const page = await Page.findOne({ 
//       slug: req.params.slug.toLowerCase(), 
//       isPublished: true 
//     });
    
//     if (!page) {
//       return res.status(404).json({ message: 'Page not found.' });
//     }
    
//     // Make sure to include heroImage and all fields
//     const response = {
//       _id: page._id,
//       title: page.title,
//       slug: page.slug,
//       template: page.template,
//       seoTitle: page.seoTitle,
//       seoDescription: page.seoDescription,
//       ogImage: page.ogImage,
//       heroImage: page.heroImage || '',  // ← Make sure this is included
//       heroImageAlt: page.heroImageAlt || '',
//       heroTitle: page.heroTitle || '',
//       heroSubtitle: page.heroSubtitle || '',
//       policyContent: page.policyContent || {},
//       navLinks: page.navLinks || [],
//       lastUpdated: page.lastUpdated,
//       isPublished: page.isPublished,
//       // Contact page fields
//       contactEmail: page.contactEmail,
//       contactPhone: page.contactPhone,
//       contactAddress: page.contactAddress,
//       contactFormEnabled: page.contactFormEnabled,
//       contactFormTitle: page.contactFormTitle,
//       contactFormDescription: page.contactFormDescription,
//       contactIntroTitle: page.contactIntroTitle,
//       contactIntroText: page.contactIntroText,
//       contactOfficeTitle: page.contactOfficeTitle,
//       contactOfficeAddress: page.contactOfficeAddress,
//       contactEmailTitle: page.contactEmailTitle,
//       contactPhoneTitle: page.contactPhoneTitle,
//       contactHoursTitle: page.contactHoursTitle,
//       contactHoursText: page.contactHoursText,
//       contactTypesTitle: page.contactTypesTitle,
//       contactTypes: page.contactTypes || [],
//       newsletterTitle: page.newsletterTitle,
//       newsletterDescription: page.newsletterDescription,
//       newsletterButtonText: page.newsletterButtonText,
//       newsletterSuccessText: page.newsletterSuccessText,
//       // About page fields
//       missionStatement: page.missionStatement,
//       foundingDate: page.foundingDate,
//       // Careers page fields
//       jobsList: page.jobsList || [],
//       // Custom page fields
//       blocks: page.blocks || [],
//     };
    
//     res.json(response);
//   } catch (err) {
//     console.error('Error fetching public page:', err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/pages/published - get all published pages
// router.get('/published/list', adminVerify, async (req, res) => {
//   try {
//     const pages = await Page.find({ isPublished: true })
//       .select('_id title slug template isPublished')
//       .sort({ title: 1 });
//     res.json(pages);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;

// routes/pages.js
const express = require('express');
const router = express.Router();
const adminVerify = require('../middlewares/adminVerify');
const { uploadPageImages, processPageImages } = require('../middlewares/pageImageUpload');
const Page = require('../models/Page');
const Activity = require('../models/Activity');

// ─── Helper ───────────────────────────────────────────────────────────────────

function applyPageImages(pageData, results) {
  if (!results) return;

  if (results.heroImage) {
    pageData.heroImage = results.heroImage;
  }

  if (pageData.blocks && Array.isArray(pageData.blocks)) {
    Object.entries(results).forEach(([key, url]) => {
      if (!key.startsWith('block_')) return;
      const idx = parseInt(key.replace('block_', ''), 10);
      if (isNaN(idx) || !pageData.blocks[idx]) return;

      const block = pageData.blocks[idx];
      if (block.type === 'hero')  block.data = { ...block.data, image: url };
      if (block.type === 'image') block.data = { ...block.data, src:   url };
    });
  }
}

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// GET /api/pages
router.get('/', adminVerify, async (req, res) => {
  try {
    const { publishedOnly } = req.query;
    const query = publishedOnly === 'true' ? { isPublished: true } : {};
    const pages = await Page.find(query).sort({ title: 1 });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/pages/:id
router.get('/:id', adminVerify, async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found.' });
    res.json(page);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/pages
router.post('/', adminVerify, uploadPageImages, processPageImages, async (req, res) => {
  try {
    const pageData = JSON.parse(req.body.data || '{}');

    if (!pageData.title?.trim()) return res.status(400).json({ message: 'Page title is required.' });
    if (!pageData.slug?.trim())  return res.status(400).json({ message: 'Page slug is required.' });

    const existing = await Page.findOne({ slug: pageData.slug.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: `A page with slug "${pageData.slug}" already exists.` });

    applyPageImages(pageData, req.pageImageResults || {});

    const page = new Page(pageData);
    await page.save();
    await Activity.create({ action: 'Created page', title: page.title });
    res.status(201).json(page);
  } catch (err) {
    console.error('Create page error:', err);
    if (err.code === 11000) return res.status(400).json({ message: 'A page with this slug already exists.' });
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/pages/:id
router.put('/:id', adminVerify, uploadPageImages, processPageImages, async (req, res) => {
  try {
    const pageData = JSON.parse(req.body.data || '{}');

    if (pageData.slug?.trim()) {
      const existing = await Page.findOne({
        _id: { $ne: req.params.id },
        slug: pageData.slug.toLowerCase().trim(),
      });
      if (existing) return res.status(400).json({ message: `A page with slug "${pageData.slug}" already exists.` });
    }

    applyPageImages(pageData, req.pageImageResults || {});

    pageData.updatedAt = Date.now();
    const page = await Page.findByIdAndUpdate(req.params.id, pageData, { new: true });
    if (!page) return res.status(404).json({ message: 'Page not found.' });

    await Activity.create({ action: 'Updated page', title: page.title });
    res.json(page);
  } catch (err) {
    console.error('Update page error:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/pages/:id
router.delete('/:id', adminVerify, async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found.' });
    await Activity.create({ action: 'Deleted page', title: page.title });
    res.json({ message: 'Page deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// GET /api/pages/public/:slug
router.get('/public/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({
      slug: req.params.slug.toLowerCase(),
      isPublished: true,
    });
    if (!page) return res.status(404).json({ message: 'Page not found.' });

    res.json({
      _id: page._id,
      title: page.title,
      slug: page.slug,
      template: page.template,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      ogImage: page.ogImage,
      heroImage: page.heroImage || '',
      heroImageAlt: page.heroImageAlt || '',
      heroTitle: page.heroTitle || '',
      heroSubtitle: page.heroSubtitle || '',
      policyContent: page.policyContent || {},
      navLinks: page.navLinks || [],
      lastUpdated: page.lastUpdated,
      isPublished: page.isPublished,
      contactEmail: page.contactEmail,
      contactPhone: page.contactPhone,
      contactAddress: page.contactAddress,
      contactFormEnabled: page.contactFormEnabled,
      contactFormTitle: page.contactFormTitle,
      contactFormDescription: page.contactFormDescription,
      contactIntroTitle: page.contactIntroTitle,
      contactIntroText: page.contactIntroText,
      contactOfficeTitle: page.contactOfficeTitle,
      contactOfficeAddress: page.contactOfficeAddress,
      contactEmailTitle: page.contactEmailTitle,
      contactPhoneTitle: page.contactPhoneTitle,
      contactHoursTitle: page.contactHoursTitle,
      contactHoursText: page.contactHoursText,
      contactTypesTitle: page.contactTypesTitle,
      contactTypes: page.contactTypes || [],
      newsletterTitle: page.newsletterTitle,
      newsletterDescription: page.newsletterDescription,
      newsletterButtonText: page.newsletterButtonText,
      newsletterSuccessText: page.newsletterSuccessText,
      missionStatement: page.missionStatement,
      foundingDate: page.foundingDate,
      jobsList: page.jobsList || [],
      blocks: page.blocks || [],
    });
  } catch (err) {
    console.error('Error fetching public page:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/pages/published/list
router.get('/published/list', adminVerify, async (req, res) => {
  try {
    const pages = await Page.find({ isPublished: true })
      .select('_id title slug template isPublished')
      .sort({ title: 1 });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;