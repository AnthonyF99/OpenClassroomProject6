const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const sharpConfig = {
  jpeg: { quality: 80, progressive: true },
  webp: { quality: 80 },
  png: { compressionLevel: 9, adaptiveFiltering: true }
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

const upload = multer({ storage: storage }).single('image');

const optimizeImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const { path: filePath, filename } = req.file;
  const outputDirectory = 'images';
  const tempOutputFilePath = path.join(outputDirectory, 'temp_' + filename);

  try {
    // Ensure the images directory exists
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    await sharp(filePath)
      .resize({ width: 206 })  // Resize image to a width of 206px, maintaining aspect ratio
      .jpeg(sharpConfig.jpeg)
      .toFile(tempOutputFilePath);

    // Replace the original file with the optimized file
    fs.rename(tempOutputFilePath, filePath, (err) => {
      if (err) {
        console.error('Failed to rename optimized file:', err);
        return res.status(500).send('Error processing image');
      }

      next();
    });
  } catch (error) {
    console.error('Error optimizing image:', error);
    res.status(500).send('Error processing image');
  }
};

module.exports = {
  upload,
  optimizeImage
};
