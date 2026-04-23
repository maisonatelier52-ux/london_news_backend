

// // routes/authors.js
// const express = require('express');
// const router = express.Router();
// const adminVerify = require('../middlewares/adminVerify');
// const { uploadSingle, processImages } = require('../middlewares/imageUpload');
// const Author = require('../models/Author');
// const Activity = require('../models/Activity');

// // GET /api/authors
// router.get('/', adminVerify, async (req, res) => {
//   try {
//     const authors = await Author.find().populate('category', 'name').sort({ createdAt: -1 });
//     res.json(authors);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // GET /api/authors/by-slug/:slug  — public lookup for author detail page
// router.get('/by-slug/:slug', async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const authors = await Author.find().populate('category', 'name slug');
//     const author = authors.find((a) => {
//       const s = a.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
//       return s === slug;
//     });
//     if (!author) return res.status(404).json({ message: 'Author not found.' });
//     res.json(author);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // GET /api/authors/:id
// router.get('/:id', adminVerify, async (req, res) => {
//   try {
//     const author = await Author.findById(req.params.id).populate('category', 'name');
//     if (!author) return res.status(404).json({ message: 'Author not found.' });
//     res.json(author);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // POST /api/authors
// router.post('/', adminVerify, uploadSingle, processImages, async (req, res) => {
//   try {
//     const authorData = JSON.parse(req.body.data);

//     if (!authorData.name || !authorData.name.trim()) {
//       return res.status(400).json({ message: 'Author name is required.' });
//     }
//     if (!authorData.category) {
//       return res.status(400).json({ message: 'Category is required.' });
//     }
//     if (authorData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorData.email)) {
//       return res.status(400).json({ message: 'Invalid email address.' });
//     }
//     if (authorData.websiteLink && !/^https?:\/\/.+/.test(authorData.websiteLink)) {
//       return res.status(400).json({ message: 'Website URL must start with http:// or https://' });
//     }

//     const existing = await Author.findOne({
//       name: { $regex: new RegExp(`^${authorData.name.trim()}$`, 'i') },
//     });
//     if (existing) {
//       return res.status(400).json({ message: `An author named "${authorData.name.trim()}" already exists.` });
//     }

//     // ImageKit returns full URL — store it directly
//     if (req.file && req.file.savedPath) {
//       authorData.profileImage = req.file.savedPath;
//     }

//     const author = new Author(authorData);
//     await author.save();
//     await Activity.create({ action: 'Created author', title: author.name });
//     res.status(201).json(author);
//   } catch (error) {
//     console.error('Create author error:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // PUT /api/authors/:id
// router.put('/:id', adminVerify, uploadSingle, processImages, async (req, res) => {
//   try {
//     const authorData = JSON.parse(req.body.data);

//     if (authorData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorData.email)) {
//       return res.status(400).json({ message: 'Invalid email address.' });
//     }
//     if (authorData.websiteLink && !/^https?:\/\/.+/.test(authorData.websiteLink)) {
//       return res.status(400).json({ message: 'Website URL must start with http:// or https://' });
//     }

//     if (authorData.name && authorData.name.trim()) {
//       const existing = await Author.findOne({
//         _id: { $ne: req.params.id },
//         name: { $regex: new RegExp(`^${authorData.name.trim()}$`, 'i') },
//       });
//       if (existing) {
//         return res.status(400).json({ message: `An author named "${authorData.name.trim()}" already exists.` });
//       }
//     }

//     // ImageKit returns full URL — store it directly
//     if (req.file && req.file.savedPath) {
//       authorData.profileImage = req.file.savedPath;
//     }

//     authorData.updatedAt = Date.now();
//     const author = await Author.findByIdAndUpdate(req.params.id, authorData, { new: true });
//     if (!author) return res.status(404).json({ message: 'Author not found.' });

//     await Activity.create({ action: 'Updated author', title: author.name });
//     res.json(author);
//   } catch (error) {
//     console.error('Update author error:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // DELETE /api/authors/:id
// router.delete('/:id', adminVerify, async (req, res) => {
//   try {
//     const author = await Author.findByIdAndDelete(req.params.id);
//     if (!author) return res.status(404).json({ message: 'Author not found.' });
//     await Activity.create({ action: 'Deleted author', title: author.name });
//     res.json({ message: 'Author deleted successfully.' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;

// routes/authors.js
const express = require('express');
const router = express.Router();
const adminVerify = require('../middlewares/adminVerify');
const { uploadSingle, processImages } = require('../middlewares/imageUpload');
const Author = require('../models/Author');
const Activity = require('../models/Activity');

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET /api/authors  (admin)
router.get('/', adminVerify, async (req, res) => {
  try {
    const authors = await Author.find().populate('category', 'name').sort({ createdAt: -1 });
    res.json(authors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/authors/by-slug/:slug  — public, used by user-side author page
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const author = await Author.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    if (!author) return res.status(404).json({ message: 'Author not found.' });
    res.json(author);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/authors/:id  (admin)
router.get('/:id', adminVerify, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id).populate('category', 'name');
    if (!author) return res.status(404).json({ message: 'Author not found.' });
    res.json(author);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/authors
router.post('/', adminVerify, uploadSingle, processImages, async (req, res) => {
  try {
    const authorData = JSON.parse(req.body.data);

    if (!authorData.name?.trim())
      return res.status(400).json({ message: 'Author name is required.' });
    if (!authorData.category)
      return res.status(400).json({ message: 'Category is required.' });
    if (authorData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorData.email))
      return res.status(400).json({ message: 'Invalid email address.' });
    if (authorData.websiteLink && !/^https?:\/\/.+/.test(authorData.websiteLink))
      return res.status(400).json({ message: 'Website URL must start with http:// or https://' });

    // Auto-generate slug if not provided, then ensure uniqueness
    let slug = authorData.slug?.trim() ? authorData.slug.trim() : generateSlug(authorData.name);
    const slugExists = await Author.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }
    authorData.slug = slug;

    const existing = await Author.findOne({
      name: { $regex: new RegExp(`^${authorData.name.trim()}$`, 'i') },
    });
    if (existing)
      return res.status(400).json({ message: `An author named "${authorData.name.trim()}" already exists.` });

    if (req.file?.savedPath) authorData.profileImage = req.file.savedPath;

    const author = new Author(authorData);
    await author.save();
    await Activity.create({ action: 'Created author', title: author.name });
    res.status(201).json(author);
  } catch (error) {
    console.error('Create author error:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/authors/:id
router.put('/:id', adminVerify, uploadSingle, processImages, async (req, res) => {
  try {
    const authorData = JSON.parse(req.body.data);

    if (authorData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorData.email))
      return res.status(400).json({ message: 'Invalid email address.' });
    if (authorData.websiteLink && !/^https?:\/\/.+/.test(authorData.websiteLink))
      return res.status(400).json({ message: 'Website URL must start with http:// or https://' });

    if (authorData.name?.trim()) {
      const existing = await Author.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: new RegExp(`^${authorData.name.trim()}$`, 'i') },
      });
      if (existing)
        return res.status(400).json({ message: `An author named "${authorData.name.trim()}" already exists.` });
    }

    // Handle slug: if provided use it, else generate from name
    if (authorData.slug?.trim()) {
      const slugExists = await Author.findOne({ slug: authorData.slug.trim(), _id: { $ne: req.params.id } });
      if (slugExists)
        return res.status(400).json({ message: `Slug "${authorData.slug}" is already taken.` });
      authorData.slug = authorData.slug.trim();
    } else if (authorData.name?.trim()) {
      // Only regenerate if slug not explicitly set
      const current = await Author.findById(req.params.id);
      if (!current?.slug) {
        authorData.slug = generateSlug(authorData.name);
      }
    }

    if (req.file?.savedPath) authorData.profileImage = req.file.savedPath;

    authorData.updatedAt = Date.now();
    const author = await Author.findByIdAndUpdate(req.params.id, authorData, { new: true });
    if (!author) return res.status(404).json({ message: 'Author not found.' });

    await Activity.create({ action: 'Updated author', title: author.name });
    res.json(author);
  } catch (error) {
    console.error('Update author error:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/authors/:id
router.delete('/:id', adminVerify, async (req, res) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) return res.status(404).json({ message: 'Author not found.' });
    await Activity.create({ action: 'Deleted author', title: author.name });
    res.json({ message: 'Author deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;