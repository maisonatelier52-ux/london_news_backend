
// routes/public.js
const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Author = require('../models/Author');
const Category = require('../models/Category');
const Homepage = require('../models/Homepage');
const MoodSurvey = require('../models/MoodSurvey');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

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

// Today date string
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// ─── MOOD ─────────────────────────────────────────────────────────────────────

// GET /api/public/mood
router.get('/mood', async (req, res) => {
  try {
     function timeAgo(date) {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) {
        return `Updated ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }

      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return `Updated ${hours} hour${hours !== 1 ? 's' : ''} ago`;
      }

      const days = Math.floor(hours / 24);
      return `Updated ${days} day${days !== 1 ? 's' : ''} ago`;
    }
    let survey = await MoodSurvey.findOne({ date: todayStr() });
    if (!survey) {
      const last = await MoodSurvey.findOne().sort({ createdAt: -1 });
      survey = {
        updatedAt: last?.updatedAt,
        headline: last?.headline || "London is okay right now",
        updatedText: last?.updatedText || "Updated 32 minutes ago",
        surveyTitle: last?.surveyTitle || "London's Mood Right Now",
        surveyButtonLabel: last?.surveyButtonLabel || "Take Part in Our Daily Survey",
        surveySuccessText: last?.surveySuccessText || "Thanks for sharing your mood!",
        options: last?.options || [
          { key: "happy", label: "Happy", votes: 82 },
          { key: "sad", label: "Sad", votes: 6 },
          { key: "okay", label: "Can't complain", votes: 12 },
        ],
      };
    }

    const options = survey.options || [];
    const totalVotes = options.reduce((sum, o) => sum + (o.votes || 0), 0);
    const moodBreakdown = options.map(o => ({
      key: o.key,
      label: o.label,
      value: totalVotes > 0 ? `${Math.round(((o.votes || 0) / totalVotes) * 100)}%` : '0%',
      votes: o.votes || 0,
    }));

    res.json({
      moodHeadline: survey.headline,
      moodUpdatedText: survey.updatedText,
      surveyTitle: survey.surveyTitle,
      surveyButtonLabel: survey.surveyButtonLabel,
      surveySuccessText: survey.surveySuccessText,
      moodOptions: options.map(o => ({ key: o.key, label: o.label })),
      moodBreakdown,
      moodTotalVotes: totalVotes,
      updatedAt: timeAgo(survey.updatedAt)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/public/mood/vote
router.post('/mood/vote', async (req, res) => {
  try {
    const { optionKey } = req.body;
    if (!optionKey) return res.status(400).json({ error: 'optionKey is required' });

    let survey = await MoodSurvey.findOne({ date: todayStr() });
    if (!survey) {
      const last = await MoodSurvey.findOne().sort({ createdAt: -1 });
      survey = await MoodSurvey.create({
        date: todayStr(),
        headline: last?.headline || "London is okay right now",
        updatedText: "Updated just now",
        surveyTitle: last?.surveyTitle || "London's Mood Right Now",
        surveyButtonLabel: last?.surveyButtonLabel || "Take Part in Our Daily Survey",
        surveySuccessText: last?.surveySuccessText || "Thanks for sharing your mood!",
        options: last?.options?.map(o => ({ key: o.key, label: o.label, votes: 0 })) || [
          { key: "happy", label: "Happy", votes: 0 },
          { key: "sad", label: "Sad", votes: 0 },
          { key: "okay", label: "Can't complain", votes: 0 },
        ],
      });
    }

    const option = survey.options.find(o => o.key === optionKey);
    if (!option) return res.status(400).json({ error: 'Invalid option key' });

    option.votes += 1;
    await survey.save();

    const totalVotes = survey.options.reduce((sum, o) => sum + o.votes, 0);
    const moodBreakdown = survey.options.map(o => ({
      key: o.key,
      label: o.label,
      value: totalVotes > 0 ? `${Math.round((o.votes / totalVotes) * 100)}%` : '0%',
      votes: o.votes,
    }));

    res.json({ moodBreakdown, moodTotalVotes: totalVotes, surveySuccessText: survey.surveySuccessText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────

// GET /api/public/homepage — active homepage with resolved articles
router.get('/homepage', async (req, res) => {
  try {
    const homepage = await Homepage.findOne({ isActive: true });
    if (!homepage) return res.status(404).json({ message: 'No active homepage.' });

    const hp = homepage.toObject();
    const articleIds = [];
    for (const section of hp.sections) {
      for (const slot of section.slots || []) {
        if (slot.articleId) articleIds.push(slot.articleId.toString());
      }
    }

    const articles = await Article.find({ _id: { $in: articleIds } })
      .populate('category', 'name slug')
      .populate('author', 'name slug profileImage')
      .lean();

    const articleMap = {};
    articles.forEach(a => { articleMap[a._id.toString()] = a; });

    for (const section of hp.sections) {
      for (const slot of section.slots || []) {
        if (slot.articleId) {
          const raw = articleMap[slot.articleId.toString()];
          slot.article = raw ? formatArticle({ ...raw, _id: raw._id }) : null;
        }
      }
    }

    // Sort sections by order
    hp.sections.sort((a, b) => a.order - b.order);

    res.json(hp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

// GET /api/public/categories — only visible categories, sorted by position
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isVisible: true }).sort({ position: 1, name: 1 });
    res.json(categories.map(c => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      bannerImage: c.bannerImage || '',
      description: c.description || '',
      seoTitle: c.seoTitle || '',
      seoDescription: c.seoDescription || '',
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/public/category/:slug
router.get('/category/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug.toLowerCase(), isVisible: true });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      bannerImage: category.bannerImage || '',
      description: category.description || '',
      seoTitle: category.seoTitle || '',
      seoDescription: category.seoDescription || '',
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

    // Only articles from visible categories
    const visibleCats = await Category.find({ isVisible: true }).select('_id');
    const visibleCatIds = visibleCats.map(c => c._id);

    let filter = { isPublished: true, category: { $in: visibleCatIds } };
    if (excludeCategory) {
      const cat = await Category.findOne({ slug: excludeCategory.toLowerCase() });
      if (cat) filter.category = { $in: visibleCatIds.filter(id => id.toString() !== cat._id.toString()) };
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

    // Check category visibility
    const cat = await Category.findById(article.category._id);
    if (!cat || !cat.isVisible) return res.status(404).json({ message: 'Article not found.' });

    const siblings = await Article.find({ category: article.category._id, isPublished: true })
      .select('_id slug title date')
      .sort({ date: -1 });

    const currentIdx = siblings.findIndex(s => s._id.toString() === article._id.toString());
    const prevArticle = currentIdx > 0 ? { slug: siblings[currentIdx - 1].slug, title: siblings[currentIdx - 1].title } : null;
    const nextArticle = currentIdx < siblings.length - 1 ? { slug: siblings[currentIdx + 1].slug, title: siblings[currentIdx + 1].title } : null;

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
    const category = await Category.findOne({ slug: categorySlug.toLowerCase(), isVisible: true });
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
        category: author.category ? { name: author.category.name, slug: author.category.slug } : null,
      },
      articles: articles.map(formatArticle),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/public/pages — get all published pages (for header/footer)
router.get('/public/pages', async (req, res) => {
  try {
    const pages = await Page.find({ isPublished: true })
      .select('title slug template')
      .sort({ publishedAt: 1 });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add to routes/public.js

// GET /api/public/footer - get footer configuration
router.get('/footer', async (req, res) => {
  try {
    const Footer = require('../models/Footer');
    const Page = require('../models/Page');
    
    let footer = await Footer.findOne();
    
    if (!footer) {
      // Return default footer if none exists
      return res.json({
        siteDescription: "Independent coverage of London politics, business, culture, lifestyle, technology and sport.",
        column1Title: "Newsroom",
        column2Title: "Standards",
        column3Title: "Legal",
        column4Title: "Get Involved",
        column1Links: [],
        column2Links: [],
        column3Links: [],
        column4Links: [],
        socialLinks: {},
        copyrightText: "© 2026 London News. All Rights Reserved.",
        newsletterTitle: "Stay Ahead of London",
        newsletterDescription: "Get the latest London news delivered directly to your inbox.",
        newsletterButtonText: "Subscribe",
        newsletterSuccessText: "Thanks for subscribing! Check your inbox.",
      });
    }
    
    // Get all published pages to resolve page references
    const publishedPages = await Page.find({ isPublished: true }).select('title slug _id');
    const pageMap = {};
    publishedPages.forEach(page => {
      pageMap[page._id.toString()] = page;
      pageMap[page.slug] = page;
    });
    
    // Helper function to resolve links
    const resolveLinks = (links) => {
      if (!links || !Array.isArray(links)) return [];
      
      return links.map(link => {
        // If link has slug already, use it directly
        if (link.slug) {
          // Verify the page exists and is published
          const pageExists = publishedPages.some(p => p.slug === link.slug);
          if (pageExists) {
            return {
              title: link.title,
              slug: link.slug,
              externalUrl: link.externalUrl,
            };
          }
        }
        
        // If link has pageId, resolve it
        if (link.pageId && pageMap[link.pageId.toString()]) {
          const page = pageMap[link.pageId.toString()];
          return {
            title: link.title || page.title,
            slug: page.slug,
            externalUrl: link.externalUrl,
          };
        }
        
        return null;
      }).filter(link => link !== null && link.title);
    };
    
    const footerData = footer.toObject();
    
    // Resolve links for all columns
    footerData.column1Links = resolveLinks(footerData.column1Links);
    footerData.column2Links = resolveLinks(footerData.column2Links);
    footerData.column3Links = resolveLinks(footerData.column3Links);
    footerData.column4Links = resolveLinks(footerData.column4Links);
    
    res.json(footerData);
  } catch (err) {
    console.error('Public footer API error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;