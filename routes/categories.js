
// // routes/categories.js
// const express = require('express');
// const router = express.Router();
// const adminVerify = require('../middlewares/adminVerify');
// const { uploadSingle, processImages } = require('../middlewares/imageUpload');
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
// router.post('/', adminVerify, uploadSingle, processImages, async (req, res) => {
//   try {
//     const { name, slug } = JSON.parse(req.body.data || '{}');
//     const { name: nameDirect, slug: slugDirect } = req.body;

//     // Handle both JSON string and direct form data
//     const categoryName = name || nameDirect;
//     const categorySlug = slug || slugDirect;

//     if (!categoryName || !categoryName.trim()) {
//       return res.status(400).json({ message: 'Category name is required.' });
//     }

//     const computedSlug = categorySlug || categoryName.toLowerCase().replace(/\s+/g, '-');

//     // Check duplicate name or slug
//     const existing = await Category.findOne({
//       $or: [
//         { name: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') } },
//         { slug: computedSlug },
//       ],
//     });
//     if (existing) {
//       if (existing.name.toLowerCase() === categoryName.trim().toLowerCase()) {
//         return res.status(400).json({ message: `A category named "${categoryName.trim()}" already exists.` });
//       }
//       return res.status(400).json({ message: `A category with slug "${computedSlug}" already exists.` });
//     }

//     const categoryData = { 
//       name: categoryName.trim(), 
//       slug: computedSlug 
//     };
    
//     if (req.file?.savedPath) {
//       categoryData.bannerImage = req.file.savedPath;
//     }

//     const category = new Category(categoryData);
//     await category.save();
//     await Activity.create({ action: 'Created category', title: category.name });
//     res.status(201).json(category);
//   } catch (error) {
//     console.error('Create category error:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // PUT /api/categories/:id
// router.put('/:id', adminVerify, uploadSingle, processImages, async (req, res) => {
//   try {
//     const { name, slug, existingBannerImage } = JSON.parse(req.body.data || '{}');
//     const { name: nameDirect, slug: slugDirect } = req.body;

//     // Handle both JSON string and direct form data
//     const categoryName = name || nameDirect;
//     const categorySlug = slug || slugDirect;

//     if (!categoryName || !categoryName.trim()) {
//       return res.status(400).json({ message: 'Category name is required.' });
//     }

//     const computedSlug = categorySlug || categoryName.toLowerCase().replace(/\s+/g, '-');

//     // Check duplicate — exclude the current category from the check
//     const existing = await Category.findOne({
//       _id: { $ne: req.params.id },
//       $or: [
//         { name: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') } },
//         { slug: computedSlug },
//       ],
//     });
//     if (existing) {
//       if (existing.name.toLowerCase() === categoryName.trim().toLowerCase()) {
//         return res.status(400).json({ message: `A category named "${categoryName.trim()}" already exists.` });
//       }
//       return res.status(400).json({ message: `A category with slug "${computedSlug}" already exists.` });
//     }

//     const updateData = { 
//       name: categoryName.trim(), 
//       slug: computedSlug,
//       updatedAt: Date.now()
//     };
    
//     // If a new image was uploaded, use it
//     if (req.file?.savedPath) {
//       updateData.bannerImage = req.file.savedPath;
//     } else if (existingBannerImage !== undefined) {
//       // Keep existing image (no change)
//       updateData.bannerImage = existingBannerImage;
//     }

//     const category = await Category.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );

//     if (!category) return res.status(404).json({ message: 'Category not found.' });

//     await Activity.create({ action: 'Updated category', title: category.name });
//     res.json(category);
//   } catch (error) {
//     console.error('Update category error:', error);
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
    const categories = await Category.find().sort({ position: 1, createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories
router.post('/', adminVerify, uploadSingle, processImages, async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    const categoryName = data.name || req.body.name;
    const categorySlug = data.slug || req.body.slug;
    const categoryPosition = data.position !== undefined ? parseInt(data.position) : 99;

    // Check required fields
    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    if (!categorySlug || !categorySlug.trim()) {
      return res.status(400).json({ message: 'Category slug is required.' });
    }
    if (!data.description || !data.description.trim()) {
      return res.status(400).json({ message: 'Description is required.' });
    }
    if (!data.bannerImageAlt || !data.bannerImageAlt.trim()) {
      return res.status(400).json({ message: 'Banner image alt text is required.' });
    }
    if (!data.seoTitle || !data.seoTitle.trim()) {
      return res.status(400).json({ message: 'SEO title is required.' });
    }
    if (!data.seoDescription || !data.seoDescription.trim()) {
      return res.status(400).json({ message: 'SEO description is required.' });
    }
    if (!req.file?.savedPath) {
      return res.status(400).json({ message: 'Banner image is required.' });
    }

    const computedSlug = categorySlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check for existing name, slug, or position
    const existingByName = await Category.findOne({ 
      name: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') } 
    });
    if (existingByName) {
      return res.status(400).json({ message: `A category named "${categoryName.trim()}" already exists.` });
    }

    const existingBySlug = await Category.findOne({ slug: computedSlug });
    if (existingBySlug) {
      return res.status(400).json({ message: `A category with slug "${computedSlug}" already exists.` });
    }

    const existingByPosition = await Category.findOne({ position: categoryPosition });
    if (existingByPosition) {
      return res.status(400).json({ message: `A category with position "${categoryPosition}" already exists. Please choose a different position.` });
    }

    const categoryData = {
      name: categoryName.trim(),
      slug: computedSlug,
      description: data.description.trim(),
      position: categoryPosition,
      isVisible: data.isVisible !== undefined ? Boolean(data.isVisible) : true,
      showInTopNav: data.showInTopNav !== undefined ? Boolean(data.showInTopNav) : true,
      seoTitle: data.seoTitle.trim(),
      seoDescription: data.seoDescription.trim(),
      bannerImageAlt: data.bannerImageAlt.trim(),
      bannerImage: req.file.savedPath,
    };

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
    const data = JSON.parse(req.body.data || '{}');
    const categoryName = data.name || req.body.name;
    const categorySlug = data.slug || req.body.slug;
    const categoryPosition = data.position !== undefined ? parseInt(data.position) : 99;

    // Check required fields
    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    if (!categorySlug || !categorySlug.trim()) {
      return res.status(400).json({ message: 'Category slug is required.' });
    }
    if (!data.description || !data.description.trim()) {
      return res.status(400).json({ message: 'Description is required.' });
    }
    if (!data.bannerImageAlt || !data.bannerImageAlt.trim()) {
      return res.status(400).json({ message: 'Banner image alt text is required.' });
    }
    if (!data.seoTitle || !data.seoTitle.trim()) {
      return res.status(400).json({ message: 'SEO title is required.' });
    }
    if (!data.seoDescription || !data.seoDescription.trim()) {
      return res.status(400).json({ message: 'SEO description is required.' });
    }

    const computedSlug = categorySlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check for existing name (excluding current category)
    const existingByName = await Category.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${categoryName.trim()}$`, 'i') }
    });
    if (existingByName) {
      return res.status(400).json({ message: `A category named "${categoryName.trim()}" already exists.` });
    }

    // Check for existing slug (excluding current category)
    const existingBySlug = await Category.findOne({
      _id: { $ne: req.params.id },
      slug: computedSlug
    });
    if (existingBySlug) {
      return res.status(400).json({ message: `A category with slug "${computedSlug}" already exists.` });
    }

    // Check for existing position (excluding current category)
    const existingByPosition = await Category.findOne({
      _id: { $ne: req.params.id },
      position: categoryPosition
    });
    if (existingByPosition) {
      return res.status(400).json({ message: `A category with position "${categoryPosition}" already exists. Please choose a different position.` });
    }

    const updateData = {
      name: categoryName.trim(),
      slug: computedSlug,
      description: data.description.trim(),
      position: categoryPosition,
      isVisible: data.isVisible !== undefined ? Boolean(data.isVisible) : true,
      showInTopNav: data.showInTopNav !== undefined ? Boolean(data.showInTopNav) : true,
      seoTitle: data.seoTitle.trim(),
      seoDescription: data.seoDescription.trim(),
      bannerImageAlt: data.bannerImageAlt.trim(),
      updatedAt: Date.now(),
    };

    if (req.file?.savedPath) {
      updateData.bannerImage = req.file.savedPath;
    } else if (data.existingBannerImage !== undefined) {
      updateData.bannerImage = data.existingBannerImage;
    } else {
      return res.status(400).json({ message: 'Banner image is required.' });
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
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