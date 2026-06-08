// // routes/footer.js
// const express = require('express');
// const router = express.Router();
// const adminVerify = require('../middlewares/adminVerify');
// const { uploadSingle, processImages } = require('../middlewares/imageUpload');
// const Footer = require('../models/Footer');
// const Activity = require('../models/Activity');

// // ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// // GET /api/footer — get footer settings
// router.get('/', adminVerify, async (req, res) => {
//   try {
//     let footer = await Footer.findOne({ isActive: true });
//     if (!footer) {
//       // Create default footer if none exists
//       footer = await Footer.create({});
//     }
//     res.json(footer);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // PUT /api/footer — update footer settings
// router.put('/', adminVerify, uploadSingle, processImages, async (req, res) => {
//   try {
//     let footer = await Footer.findOne({ isActive: true });
//     const footerData = JSON.parse(req.body.data || '{}');
    
//     if (!footer) {
//       footer = new Footer(footerData);
//     } else {
//       Object.assign(footer, footerData);
//     }
    
//     if (req.file?.savedPath) {
//       footer.backgroundImage = req.file.savedPath;
//     }
    
//     await footer.save();
//     await Activity.create({ action: 'Updated footer settings', title: 'Footer Configuration' });
//     res.json(footer);
//   } catch (err) {
//     console.error('Update footer error:', err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────

// // GET /api/public/footer — get active footer settings
// router.get('/public/footer', async (req, res) => {
//   try {
//     let footer = await Footer.findOne({ isActive: true });
//     if (!footer) {
//       footer = await Footer.create({});
//     }
    
//     // Remove any sensitive data if needed
//     const publicFooter = footer.toObject();
//     res.json(publicFooter);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;


// routes/footer.js
const express = require('express');
const router = express.Router();
const adminVerify = require('../middlewares/adminVerify');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Footer = require('../models/Footer');
const Page = require('../models/Page');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/footer';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'footer-bg-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 }, // 100KB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Only .webp format allowed'));
    }
  }
});

// ─── ADMIN ROUTES ────────────────────────────────────────────────────────────

// GET /api/footer - get footer configuration
router.get('/', adminVerify, async (req, res) => {
  try {
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
    res.json(footer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/footer - update footer configuration
router.put('/', adminVerify, upload.single('profileImage'), async (req, res) => {
  try {
    let footer = await Footer.findOne();
    const footerData = JSON.parse(req.body.data || '{}');
    
    // Handle image upload
    if (req.file) {
      footerData.backgroundImage = `/uploads/footer/${req.file.filename}`;
    }
    
    if (footer) {
      // Update existing footer
      Object.assign(footer, footerData);
      footer.updatedAt = Date.now();
      await footer.save();
    } else {
      // Create new footer
      footer = await Footer.create(footerData);
    }
    
    res.json(footer);
  } catch (err) {
    console.error('Footer update error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────

// routes/footer.js - Update the public endpoint

// GET /api/public/footer - public footer configuration
router.get('/public/footer', async (req, res) => {
  try {
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
        backgroundImage: "",  // Add this
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
        if (link.slug) {
          const pageExists = publishedPages.some(p => p.slug === link.slug);
          if (pageExists) {
            return {
              title: link.title,
              slug: link.slug,
              externalUrl: link.externalUrl,
            };
          }
        }
        
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
    
    // Make sure backgroundImage is included
    const response = {
      siteDescription: footerData.siteDescription,
      column1Title: footerData.column1Title,
      column2Title: footerData.column2Title,
      column3Title: footerData.column3Title,
      column4Title: footerData.column4Title,
      column1Links: footerData.column1Links,
      column2Links: footerData.column2Links,
      column3Links: footerData.column3Links,
      column4Links: footerData.column4Links,
      socialLinks: footerData.socialLinks || {},
      copyrightText: footerData.copyrightText,
      backgroundImage: footerData.backgroundImage || '',  // Add this
      newsletterTitle: footerData.newsletterTitle,
      newsletterDescription: footerData.newsletterDescription,
      newsletterButtonText: footerData.newsletterButtonText,
      newsletterSuccessText: footerData.newsletterSuccessText,
    };
    
    res.json(response);
  } catch (err) {
    console.error('Public footer API error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Debug endpoint - remove after testing
router.get('/debug/footer', async (req, res) => {
  try {
    const footer = await Footer.findOne();
    const pages = await Page.find({ isPublished: true }).select('title slug');
    res.json({
      footerExists: !!footer,
      footerData: footer,
      publishedPages: pages,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;