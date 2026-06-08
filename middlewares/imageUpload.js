// middlewares/imageUpload.js
const multer = require('multer');
const ImageKit = require('imagekit');

const MAX_SIZE_BYTES = 100 * 1024; // 100 KB

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    cb(new Error(`"${file.originalname}" is not a .webp file. Only WebP images are allowed.`), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

/**
 * Upload a single buffer to ImageKit.
 * Returns the full ImageKit URL.
 */
async function uploadToImageKit(buffer, originalname, folder = 'news') {
  if (buffer.length > MAX_SIZE_BYTES) {
    throw new Error(
      `"${originalname}" is ${Math.round(buffer.length / 1024)} KB. ` +
      `Please upload an image under 100 KB.`
    );
  }

  const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;

  const result = await imagekit.upload({
    file: buffer,
    fileName,
    folder: `/${folder}`,
  });

  return result.url;
}

// ── Main processImages middleware ─────────────────────────────────────────────
const processImages = async (req, res, next) => {
  try {
    // Single file (author profile image)
    if (req.file && req.file.buffer) {
      req.file.savedPath = await uploadToImageKit(
        req.file.buffer,
        req.file.originalname,
        'authors'
      );
    }

    // Multiple files (article main image + content images)
    if (req.files) {
      if (req.files.mainImage && req.files.mainImage[0]) {
        const f = req.files.mainImage[0];
        req.files.mainImage[0].savedPath = await uploadToImageKit(
          f.buffer,
          f.originalname,
          'articles'
        );
      }

      if (req.files.contentImages) {
        for (let i = 0; i < req.files.contentImages.length; i++) {
          const f = req.files.contentImages[i];
          req.files.contentImages[i].savedPath = await uploadToImageKit(
            f.buffer,
            f.originalname,
            'articles/content'
          );
        }
      }
    }

    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// For single profile image (authors)
const uploadSingle = upload.single('profileImage');

// For article images
const uploadArticleImages = upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'contentImages', maxCount: 20 },
]);

module.exports = { uploadSingle, uploadArticleImages, processImages, uploadToImageKit };