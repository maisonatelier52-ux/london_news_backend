

// routes/articles.js
const express = require('express');
const router = express.Router();
const adminVerify = require('../middlewares/adminVerify');
const { uploadArticleImages, processImages } = require('../middlewares/imageUpload');
const Article = require('../models/Article');
const Activity = require('../models/Activity');

function assignContentImages(content, uploadedFiles) {
  if (!content) return content;
  const files = uploadedFiles || [];
  let fileIdx = 0;
  return content.map((block) => {
    if (block.type === 'image' && block.src === '__NEW_UPLOAD__') {
      const file = files[fileIdx];
      fileIdx++;
      return { ...block, src: file ? file.savedPath : '' };
    }
    return block;
  });
}

// GET /api/articles
router.get('/', adminVerify, async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const articles = await Article.find(query)
      .populate('category', 'name slug')
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/articles/:id
router.get('/:id', adminVerify, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('author', 'name');
    if (!article) return res.status(404).json({ message: 'Article not found.' });
    res.json(article);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/articles
router.post('/', adminVerify, uploadArticleImages, processImages, async (req, res) => {
  try {
    const articleData = JSON.parse(req.body.data);

    if (!articleData.title?.trim())   return res.status(400).json({ message: 'Title is required.' });
    if (!articleData.category)        return res.status(400).json({ message: 'Category is required.' });
    if (!articleData.excerpt?.trim()) return res.status(400).json({ message: 'Excerpt is required.' });
    if (!articleData.author || articleData.author === '') delete articleData.author;

    // Check duplicate slug
    if (articleData.slug) {
      const existing = await Article.findOne({ slug: articleData.slug.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ message: `An article with slug "${articleData.slug}" already exists. Please use a different title or slug.` });
      }
    }

    if (req.files?.mainImage?.[0]) {
      articleData.image = req.files.mainImage[0].savedPath;
    }

    articleData.content = assignContentImages(
      articleData.content,
      req.files?.contentImages ?? []
    );

    const article = new Article(articleData);
    await article.save();
    await Activity.create({ action: 'Created article', title: article.title });
    res.status(201).json(article);
  } catch (err) {
    console.error('Create article error:', err);
    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: 'An article with this slug already exists. Please use a different title or slug.' });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/articles/:id
router.put('/:id', adminVerify, uploadArticleImages, processImages, async (req, res) => {
  try {
    const articleData = JSON.parse(req.body.data);

    if (!articleData.author || articleData.author === '') delete articleData.author;

    // Check duplicate slug — exclude current article
    if (articleData.slug) {
      const existing = await Article.findOne({
        _id: { $ne: req.params.id },
        slug: articleData.slug.toLowerCase().trim(),
      });
      if (existing) {
        return res.status(400).json({ message: `An article with slug "${articleData.slug}" already exists. Please use a different slug.` });
      }
    }

    if (req.files?.mainImage?.[0]) {
      articleData.image = req.files.mainImage[0].savedPath;
    }

    articleData.content = assignContentImages(
      articleData.content,
      req.files?.contentImages ?? []
    );

    articleData.updatedAt = Date.now();
    const article = await Article.findByIdAndUpdate(req.params.id, articleData, { new: true });
    if (!article) return res.status(404).json({ message: 'Article not found.' });

    await Activity.create({ action: 'Updated article', title: article.title });
    res.json(article);
  } catch (err) {
    console.error('Update article error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'An article with this slug already exists. Please use a different slug.' });
    }
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/articles/:id
router.delete('/:id', adminVerify, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found.' });
    await Activity.create({ action: 'Deleted article', title: article.title });
    res.json({ message: 'Article deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;