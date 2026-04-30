

// // routes/public.js
// const express = require('express');
// const router = express.Router();
// const Article = require('../models/Article');
// const Author = require('../models/Author');
// const Category = require('../models/Category');

// function formatArticle(article) {
//   const cat = article.category;
//   const categorySlug = cat?.slug || '';
//   const categoryName = cat?.name || '';
//   const author = article.author || null;

//   return {
//     id: article._id.toString(),
//     slug: article.slug,
//     title: article.title,
//     excerpt: article.excerpt,
//     metaTitle: article.metaTitle,
//     metaDescription: article.metaDescription,
//     image: article.image || '',
//     imageAlt: article.imageAlt || article.title,
//     date: article.date ? article.date.toLocaleDateString('en-GB') : '',
//     readTime: article.readTime || '5 min read',
//     category: categorySlug,
//     categoryName: categoryName,
//     newsType: article.newsType,
//     type: article.type,
//     tags: article.tags || [],
//     keywords: article.keywords || [],
//     content: article.content || [],
//     views: article.views || 0,
//     author: author
//       ? {
//           id: author._id?.toString(),
//           name: author.name,
//           slug: author.slug || '',
//           bio: author.bio || '',
//           country: author.country || '',
//           profileImage: author.profileImage || '',
//           social: author.social || {},
//         }
//       : null,
//   };
// }

// // GET /api/public/categories
// router.get('/categories', async (req, res) => {
//   try {
//     const categories = await Category.find().sort({ name: 1 });
//     res.json(categories.map((c) => ({ id: c._id.toString(), name: c.name, slug: c.slug })));
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/public/latest  ← MUST be before /articles/:categorySlug
// router.get('/latest', async (req, res) => {
//   try {
//     const limit = Math.min(parseInt(req.query.limit) || 10, 50);
//     const excludeCategory = req.query.excludeCategory || null;
//     let filter = { isPublished: true };
//     if (excludeCategory) {
//       const cat = await Category.findOne({ slug: excludeCategory.toLowerCase() });
//       if (cat) filter.category = { $ne: cat._id };
//     }
//     const articles = await Article.find(filter)
//       .populate('category', 'name slug')
//       .populate('author', 'name slug profileImage')
//       .sort({ date: -1 })
//       .limit(limit);
//     res.json(articles.map(formatArticle));
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/public/articles/slug/:slug  ← MUST be before /articles/:categorySlug
// router.get('/articles/slug/:slug', async (req, res) => {
//   try {
//     const article = await Article.findOne({ slug: req.params.slug, isPublished: true })
//       .populate('category', 'name slug')
//       .populate('author', 'name slug bio country profileImage social');

//     if (!article) return res.status(404).json({ message: 'Article not found.' });

//     const siblings = await Article.find({ category: article.category._id, isPublished: true })
//       .select('_id slug title date')
//       .sort({ date: -1 });

//     const currentIdx = siblings.findIndex((s) => s._id.toString() === article._id.toString());

//     const prevArticle = currentIdx > 0
//       ? { slug: siblings[currentIdx - 1].slug, title: siblings[currentIdx - 1].title }
//       : null;

//     const nextArticle = currentIdx < siblings.length - 1
//       ? { slug: siblings[currentIdx + 1].slug, title: siblings[currentIdx + 1].title }
//       : null;

//     const relatedRaw = await Article.find({
//       category: article.category._id,
//       _id: { $ne: article._id },
//       isPublished: true,
//     })
//       .populate('category', 'name slug')
//       .populate('author', 'name slug bio country profileImage social')
//       .sort({ date: -1 })
//       .limit(3);

//     Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();

//     res.json({
//       article: formatArticle(article),
//       prevArticle,
//       nextArticle,
//       related: relatedRaw.map(formatArticle),
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/public/articles/:categorySlug
// router.get('/articles/:categorySlug', async (req, res) => {
//   try {
//     const { categorySlug } = req.params;
//     const category = await Category.findOne({ slug: categorySlug.toLowerCase() });
//     if (!category) return res.status(404).json({ message: `Category "${categorySlug}" not found.` });

//     const articles = await Article.find({ category: category._id, isPublished: true })
//       .populate('category', 'name slug')
//       .populate('author', 'name slug bio country profileImage social')
//       .sort({ date: -1 });

//     res.json(articles.map(formatArticle));
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/public/author/:slug
// router.get('/author/:slug', async (req, res) => {
//   try {
//     const author = await Author.findOne({ slug: req.params.slug }).populate('category', 'name slug');
//     if (!author) return res.status(404).json({ message: 'Author not found.' });

//     const articles = await Article.find({ author: author._id, isPublished: true })
//       .populate('category', 'name slug')
//       .populate('author', 'name slug profileImage')
//       .sort({ date: -1 })
//       .limit(12);

//     res.json({
//       author: {
//         id: author._id.toString(),
//         name: author.name,
//         slug: author.slug,
//         gender: author.gender,
//         profileImage: author.profileImage || '',
//         country: author.country || '',
//         bio: author.bio || '',
//         websiteLink: author.websiteLink || '',
//         social: author.social || {},
//         category: author.category
//           ? { name: author.category.name, slug: author.category.slug }
//           : null,
//       },
//       articles: articles.map(formatArticle),
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;

 // routes/public.js
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Author = require('../models/Author');
const Category = require('../models/Category');

function formatArticle(article) {
  const cat = article.category;
  const categorySlug = cat?.slug || '';
  const categoryName = cat?.name || '';
  const author = article.author || null;

  return {
    id: article._id.toString(),
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    image: article.image || '',
    imageAlt: article.imageAlt || article.title,
    date: article.date ? article.date.toLocaleDateString('en-GB') : '',
    readTime: article.readTime || '5 min read',
    category: categorySlug,
    categoryName: categoryName,
    newsType: article.newsType,
    type: article.type,
    tags: article.tags || [],
    keywords: article.keywords || [],
    content: article.content || [],
    views: article.views || 0,
    author: author
      ? {
          id: author._id?.toString(),
          name: author.name,
          slug: author.slug || '',
          bio: author.bio || '',
          country: author.country || '',
          profileImage: author.profileImage || '',
          social: author.social || {},
        }
      : null,
  };
}

// GET /api/public/categories (includes bannerImage)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories.map((c) => ({ 
      id: c._id.toString(), 
      name: c.name, 
      slug: c.slug,
      bannerImage: c.bannerImage || '' 
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/public/category/:slug (get single category with banner)
router.get('/category/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug.toLowerCase() });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      bannerImage: category.bannerImage || ''
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/public/latest
router.get('/latest', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const excludeCategory = req.query.excludeCategory || null;
    let filter = { isPublished: true };
    if (excludeCategory) {
      const cat = await Category.findOne({ slug: excludeCategory.toLowerCase() });
      if (cat) filter.category = { $ne: cat._id };
    }
    const articles = await Article.find(filter)
      .populate('category', 'name slug')
      .populate('author', 'name slug profileImage')
      .sort({ date: -1 })
      .limit(limit);
    res.json(articles.map(formatArticle));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/public/articles/slug/:slug
router.get('/articles/slug/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, isPublished: true })
      .populate('category', 'name slug')
      .populate('author', 'name slug bio country profileImage social');

    if (!article) return res.status(404).json({ message: 'Article not found.' });

    const siblings = await Article.find({ category: article.category._id, isPublished: true })
      .select('_id slug title date')
      .sort({ date: -1 });

    const currentIdx = siblings.findIndex((s) => s._id.toString() === article._id.toString());

    const prevArticle = currentIdx > 0
      ? { slug: siblings[currentIdx - 1].slug, title: siblings[currentIdx - 1].title }
      : null;

    const nextArticle = currentIdx < siblings.length - 1
      ? { slug: siblings[currentIdx + 1].slug, title: siblings[currentIdx + 1].title }
      : null;

    const relatedRaw = await Article.find({
      category: article.category._id,
      _id: { $ne: article._id },
      isPublished: true,
    })
      .populate('category', 'name slug')
      .populate('author', 'name slug bio country profileImage social')
      .sort({ date: -1 })
      .limit(3);

    Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();

    res.json({
      article: formatArticle(article),
      prevArticle,
      nextArticle,
      related: relatedRaw.map(formatArticle),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/public/articles/:categorySlug
router.get('/articles/:categorySlug', async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const category = await Category.findOne({ slug: categorySlug.toLowerCase() });
    if (!category) return res.status(404).json({ message: `Category "${categorySlug}" not found.` });

    const articles = await Article.find({ category: category._id, isPublished: true })
      .populate('category', 'name slug')
      .populate('author', 'name slug bio country profileImage social')
      .sort({ date: -1 });

    res.json(articles.map(formatArticle));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/public/author/:slug
router.get('/author/:slug', async (req, res) => {
  try {
    const author = await Author.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    if (!author) return res.status(404).json({ message: 'Author not found.' });

    const articles = await Article.find({ author: author._id, isPublished: true })
      .populate('category', 'name slug')
      .populate('author', 'name slug profileImage')
      .sort({ date: -1 })
      .limit(12);

    res.json({
      author: {
        id: author._id.toString(),
        name: author.name,
        slug: author.slug,
        gender: author.gender,
        profileImage: author.profileImage || '',
        country: author.country || '',
        bio: author.bio || '',
        websiteLink: author.websiteLink || '',
        social: author.social || {},
        category: author.category
          ? { name: author.category.name, slug: author.category.slug }
          : null,
      },
      articles: articles.map(formatArticle),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;