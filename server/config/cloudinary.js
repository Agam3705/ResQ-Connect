const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for general uploads (documents, missing person photos)
const generalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resq-connect/uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    transformation: [{ width: 1200, crop: 'limit' }]
  }
});

// Storage for missing person photos
const missingPersonStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resq-connect/missing-persons',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const uploadGeneral = multer({ storage: generalStorage });
const uploadMissingPerson = multer({ storage: missingPersonStorage });

// Fallback to local disk storage if Cloudinary is not configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};

// Local storage fallback
const fs = require('fs');
const path = require('path');
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const uploadLocal = multer({ storage: localStorage });

// Export the right uploader based on config
const getUploader = (type = 'general') => {
  if (isCloudinaryConfigured()) {
    return type === 'missing' ? uploadMissingPerson : uploadGeneral;
  }
  return uploadLocal;
};

module.exports = { cloudinary, getUploader, isCloudinaryConfigured };
