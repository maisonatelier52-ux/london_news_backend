// middlewares/pageImageUpload.js
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

async function uploadToImageKit(buffer, originalname, folder = 'pages') {
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

// Accepts profileImage (hero) + any number of blockImage_* fields
const uploadPageImages = upload.any();

const processPageImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return next();

    req.pageImageResults = {};

    for (const file of req.files) {
      const url = await uploadToImageKit(file.buffer, file.originalname, 'pages');

      if (file.fieldname === 'profileImage') {
        req.pageImageResults.heroImage = url;
      } else if (file.fieldname.startsWith('blockImage_')) {
        const idx = parseInt(file.fieldname.replace('blockImage_', ''), 10);
        if (!isNaN(idx)) {
          req.pageImageResults[`block_${idx}`] = url;
        }
      }
    }

    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = { uploadPageImages, processPageImages };