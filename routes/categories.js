

// // routes/categories.js
// const express = require('express');
// const router = express.Router();
// const adminVerify = require('../middlewares/adminVerify');
// const Category = require('../models/Category');
// const Article = require('../models/Article');
// const Activity = require('../models/Activity');

// // GET /api/categories
// router.get('/', adminVerify, async (req, res) => {
//   try {
//     const categories = await Category.find().sort({ createdAt: -1 });
//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // POST /api/categories
// router.post('/', adminVerify, async (req, res) => {
//   try {
//     const { name, slug } = req.body;

//     if (!name || !name.trim()) {
//       return res.status(400).json({ message: 'Category name is required.' });
//     }

//     const computedSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

//     // Check duplicate name or slug
//     const existing = await Category.findOne({
//       $or: [
//         { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } },
//         { slug: computedSlug },
//       ],
//     });
//     if (existing) {
//       if (existing.name.toLowerCase() === name.trim().toLowerCase()) {
//         return res.status(400).json({ message: `A category named "${name.trim()}" already exists.` });
//       }
//       return res.status(400).json({ message: `A category with slug "${computedSlug}" already exists.` });
//     }

//     const category = new Category({ name: name.trim(), slug: computedSlug });
//     await category.save();
//     await Activity.create({ action: 'Created category', title: category.name });
//     res.status(201).json(category);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // PUT /api/categories/:id
// router.put('/:id', adminVerify, async (req, res) => {
//   try {
//     const { name, slug } = req.body;

//     if (!name || !name.trim()) {
//       return res.status(400).json({ message: 'Category name is required.' });
//     }

//     const computedSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

//     // Check duplicate — exclude the current category from the check
//     const existing = await Category.findOne({
//       _id: { $ne: req.params.id },
//       $or: [
//         { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } },
//         { slug: computedSlug },
//       ],
//     });
//     if (existing) {
//       if (existing.name.toLowerCase() === name.trim().toLowerCase()) {
//         return res.status(400).json({ message: `A category named "${name.trim()}" already exists.` });
//       }
//       return res.status(400).json({ message: `A category with slug "${computedSlug}" already exists.` });
//     }

//     const category = await Category.findByIdAndUpdate(
//       req.params.id,
//       { name: name.trim(), slug: computedSlug, updatedAt: Date.now() },
//       { new: true }
//     );

//     if (!category) return res.status(404).json({ message: 'Category not found.' });

//     await Activity.create({ action: 'Updated category', title: category.name });
//     res.json(category);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // DELETE /api/categories/:id
// router.delete('/:id', adminVerify, async (req, res) => {
//   try {
//     const category = await Category.findById(req.params.id);
//     if (!category) return res.status(404).json({ message: 'Category not found.' });

//     await Article.deleteMany({ category: req.params.id });
//     await category.deleteOne();
//     await Activity.create({ action: 'Deleted category (and its articles)', title: category.name });

//     res.json({ message: 'Category and all its articles deleted successfully.' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// module.exports = router;

// routes/categories.js
const express = require('express');
const router = express.Router();
const adminVerify = require('../middlewares/adminVerify');
const { uploadSingle, processImages } = require('../middlewares/imageUpload');
const Category = require('../models/Category');
const Article = require('../models/Article');
const Activity = require('../models/Activity');

// GET /api/categories
router.get('/', adminVerify, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories
router.post('/', adminVerify, uploadSingle, processImages, async (req, res) => {
  try {
    const { name, slug } = JSON.parse(req.body.data || '{}');
    const { name: nameDirect, slug: slugDirect } = req.body;

    // Handle both JSON string and direct form data
    const categoryName = name || nameDirect;
    const categorySlug = slug || slugDirect;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const computedSlug = categorySlug || categoryName.toLowerCase().replace(/\s+/g, '-');

    // Check duplicate name or slug
    const existing = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') } },
        { slug: computedSlug },
      ],
    });
    if (existing) {
      if (existing.name.toLowerCase() === categoryName.trim().toLowerCase()) {
        return res.status(400).json({ message: `A category named "${categoryName.trim()}" already exists.` });
      }
      return res.status(400).json({ message: `A category with slug "${computedSlug}" already exists.` });
    }

    const categoryData = { 
      name: categoryName.trim(), 
      slug: computedSlug 
    };
    
    if (req.file?.savedPath) {
      categoryData.bannerImage = req.file.savedPath;
    }

    const category = new Category(categoryData);
    await category.save();
    await Activity.create({ action: 'Created category', title: category.name });
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', adminVerify, uploadSingle, processImages, async (req, res) => {
  try {
    const { name, slug, existingBannerImage } = JSON.parse(req.body.data || '{}');
    const { name: nameDirect, slug: slugDirect } = req.body;

    // Handle both JSON string and direct form data
    const categoryName = name || nameDirect;
    const categorySlug = slug || slugDirect;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const computedSlug = categorySlug || categoryName.toLowerCase().replace(/\s+/g, '-');

    // Check duplicate — exclude the current category from the check
    const existing = await Category.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { name: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') } },
        { slug: computedSlug },
      ],
    });
    if (existing) {
      if (existing.name.toLowerCase() === categoryName.trim().toLowerCase()) {
        return res.status(400).json({ message: `A category named "${categoryName.trim()}" already exists.` });
      }
      return res.status(400).json({ message: `A category with slug "${computedSlug}" already exists.` });
    }

    const updateData = { 
      name: categoryName.trim(), 
      slug: computedSlug,
      updatedAt: Date.now()
    };
    
    // If a new image was uploaded, use it
    if (req.file?.savedPath) {
      updateData.bannerImage = req.file.savedPath;
    } else if (existingBannerImage !== undefined) {
      // Keep existing image (no change)
      updateData.bannerImage = existingBannerImage;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!category) return res.status(404).json({ message: 'Category not found.' });

    await Activity.create({ action: 'Updated category', title: category.name });
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', adminVerify, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    await Article.deleteMany({ category: req.params.id });
    await category.deleteOne();
    await Activity.create({ action: 'Deleted category (and its articles)', title: category.name });

    res.json({ message: 'Category and all its articles deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;