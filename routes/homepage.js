// routes/homepage.js
// const express = require('express');
// const router = express.Router();
// const adminVerify = require('../middlewares/adminVerify');
// const Homepage = require('../models/Homepage');
// const Article = require('../models/Article');

// // Helper: populate sections with full article data
// async function populateHomepage(homepage) {
//   const populated = homepage.toObject ? homepage.toObject() : { ...homepage };
//   const articleIds = [];

//   for (const section of populated.sections) {
//     for (const slot of section.slots || []) {
//       if (slot.articleId) articleIds.push(slot.articleId.toString());
//     }
//   }

//   const articles = await Article.find({ _id: { $in: articleIds } })
//     .populate('category', 'name slug')
//     .populate('author', 'name slug')
//     .lean();

//   const articleMap = {};
//   articles.forEach(a => { articleMap[a._id.toString()] = a; });

//   for (const section of populated.sections) {
//     for (const slot of section.slots || []) {
//       if (slot.articleId) {
//         slot.article = articleMap[slot.articleId.toString()] || null;
//       }
//     }
//   }

//   return populated;
// }

// // ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// // GET /api/admin-homepage — list all homepages
// router.get('/', adminVerify, async (req, res) => {
//   try {
//     const homepages = await Homepage.find().sort({ isActive: -1, updatedAt: -1 });
//     res.json(homepages);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/admin-homepage — create new homepage
// router.post('/', adminVerify, async (req, res) => {
//   try {
//     const { title, slug } = req.body;
//     const homepage = await Homepage.create({
//       title: title || 'New Homepage',
//       slug: slug || `homepage-${Date.now()}`,
//     });
//     res.status(201).json(homepage);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/admin-homepage/:id — get single homepage
// router.get('/:id', adminVerify, async (req, res) => {
//   try {
//     const homepage = await Homepage.findById(req.params.id);
//     if (!homepage) return res.status(404).json({ message: 'Not found' });
//     const populated = await populateHomepage(homepage);
//     res.json(populated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // PUT /api/admin-homepage/:id — update homepage
// router.put('/:id', adminVerify, async (req, res) => {
//   try {
//     const { title, slug, seoTitle, seoDescription, seoImage, sections } = req.body;
//     const homepage = await Homepage.findByIdAndUpdate(
//       req.params.id,
//       { title, slug, seoTitle, seoDescription, seoImage, sections, updatedAt: Date.now() },
//       { new: true }
//     );
//     if (!homepage) return res.status(404).json({ message: 'Not found' });
//     res.json(homepage);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/admin-homepage/:id/activate — set as active
// router.post('/:id/activate', adminVerify, async (req, res) => {
//   try {
//     await Homepage.updateMany({}, { isActive: false });
//     const homepage = await Homepage.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
//     if (!homepage) return res.status(404).json({ message: 'Not found' });
//     res.json(homepage);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // DELETE /api/admin-homepage/:id — delete homepage
// router.delete('/:id', adminVerify, async (req, res) => {
//   try {
//     const homepage = await Homepage.findById(req.params.id);
//     if (!homepage) return res.status(404).json({ message: 'Not found' });
//     if (homepage.isActive) return res.status(400).json({ message: 'Cannot delete the active homepage.' });
//     await homepage.deleteOne();
//     res.json({ message: 'Deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ─── PUBLIC ROUTE ────────────────────────────────────────────────────────────

// // GET /api/public/homepage — get the active homepage with populated articles
// router.get('/public/active', async (req, res) => {
//   try {
//     const homepage = await Homepage.findOne({ isActive: true });
//     if (!homepage) return res.status(404).json({ message: 'No active homepage configured.' });
//     const populated = await populateHomepage(homepage);
//     res.json(populated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;

// routes/homepage.js
const express = require('express');
const router = express.Router();
const adminVerify = require('../middlewares/adminVerify');
const Homepage = require('../models/Homepage');
const Article = require('../models/Article');

// Helper: populate sections with full article data
async function populateHomepage(homepage) {
  const populated = homepage.toObject ? homepage.toObject() : { ...homepage };
  const articleIds = [];

  for (const section of populated.sections) {
    for (const slot of section.slots || []) {
      if (slot.articleId) articleIds.push(slot.articleId.toString());
    }
  }

  const articles = await Article.find({ _id: { $in: articleIds } })
    .populate('category', 'name slug')
    .populate('author', 'name slug')
    .lean();

  const articleMap = {};
  articles.forEach(a => { articleMap[a._id.toString()] = a; });

  for (const section of populated.sections) {
    for (const slot of section.slots || []) {
      if (slot.articleId) {
        slot.article = articleMap[slot.articleId.toString()] || null;
      }
    }
  }

  return populated;
}

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// GET /api/admin-homepage — list all homepages
router.get('/', adminVerify, async (req, res) => {
  try {
    const homepages = await Homepage.find().sort({ isActive: -1, updatedAt: -1 });
    res.json(homepages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin-homepage — create new homepage
router.post('/', adminVerify, async (req, res) => {
  try {
    const { title, slug } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Homepage title is required.' });
    }
    
    if (!slug || !slug.trim()) {
      return res.status(400).json({ message: 'Homepage slug is required.' });
    }
    
    const homepage = await Homepage.create({
      title: title.trim(),
      slug: slug.trim(),
    });
    res.status(201).json(homepage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin-homepage/:id — get single homepage
router.get('/:id', adminVerify, async (req, res) => {
  try {
    const homepage = await Homepage.findById(req.params.id);
    if (!homepage) return res.status(404).json({ message: 'Not found' });
    const populated = await populateHomepage(homepage);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin-homepage/:id — update homepage
router.put('/:id', adminVerify, async (req, res) => {
  try {
    const { title, slug, seoTitle, seoDescription, sections } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Homepage title is required.' });
    }
    
    if (!slug || !slug.trim()) {
      return res.status(400).json({ message: 'Homepage slug is required.' });
    }
    
    if (!seoTitle || !seoTitle.trim()) {
      return res.status(400).json({ message: 'SEO title is required.' });
    }
    
    if (!seoDescription || !seoDescription.trim()) {
      return res.status(400).json({ message: 'SEO description is required.' });
    }
    
    // Validate at least one section exists
    if (!sections || sections.length === 0) {
      return res.status(400).json({ message: 'At least one section is required.' });
    }
    
    // Validate each section has at least one article slot with an articleId
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const hasValidSlot = section.slots && section.slots.some(slot => slot.articleId);
      
      if (!hasValidSlot) {
        return res.status(400).json({ 
          message: `Section "${section.title || (i + 1)}" must have at least one article assigned.` 
        });
      }
    }
    
    const homepage = await Homepage.findByIdAndUpdate(
      req.params.id,
      { 
        title: title.trim(), 
        slug: slug.trim(), 
        seoTitle: seoTitle.trim(), 
        seoDescription: seoDescription.trim(),
        sections, 
        updatedAt: Date.now() 
      },
      { new: true }
    );
    
    if (!homepage) return res.status(404).json({ message: 'Not found' });
    res.json(homepage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin-homepage/:id/activate — set as active
router.post('/:id/activate', adminVerify, async (req, res) => {
  try {
    const homepage = await Homepage.findById(req.params.id);
    if (!homepage) return res.status(404).json({ message: 'Not found' });
    
    // Validate before activation
    if (!homepage.title || !homepage.title.trim()) {
      return res.status(400).json({ message: 'Cannot activate: Homepage title is required.' });
    }
    
    if (!homepage.slug || !homepage.slug.trim()) {
      return res.status(400).json({ message: 'Cannot activate: Homepage slug is required.' });
    }
    
    if (!homepage.seoTitle || !homepage.seoTitle.trim()) {
      return res.status(400).json({ message: 'Cannot activate: SEO title is required.' });
    }
    
    if (!homepage.seoDescription || !homepage.seoDescription.trim()) {
      return res.status(400).json({ message: 'Cannot activate: SEO description is required.' });
    }
    
    if (!homepage.sections || homepage.sections.length === 0) {
      return res.status(400).json({ message: 'Cannot activate: At least one section is required.' });
    }
    
    // Validate each section has at least one article
    for (let i = 0; i < homepage.sections.length; i++) {
      const section = homepage.sections[i];
      const hasValidSlot = section.slots && section.slots.some(slot => slot.articleId);
      
      if (!hasValidSlot) {
        return res.status(400).json({ 
          message: `Cannot activate: Section "${section.title || (i + 1)}" must have at least one article assigned.` 
        });
      }
    }
    
    await Homepage.updateMany({}, { isActive: false });
    homepage.isActive = true;
    await homepage.save();
    
    res.json(homepage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin-homepage/:id — delete homepage
router.delete('/:id', adminVerify, async (req, res) => {
  try {
    const homepage = await Homepage.findById(req.params.id);
    if (!homepage) return res.status(404).json({ message: 'Not found' });
    if (homepage.isActive) return res.status(400).json({ message: 'Cannot delete the active homepage.' });
    await homepage.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUBLIC ROUTE ────────────────────────────────────────────────────────────

// GET /api/public/homepage — get the active homepage with populated articles
router.get('/public/active', async (req, res) => {
  try {
    const homepage = await Homepage.findOne({ isActive: true });
    if (!homepage) return res.status(404).json({ message: 'No active homepage configured.' });
    const populated = await populateHomepage(homepage);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;