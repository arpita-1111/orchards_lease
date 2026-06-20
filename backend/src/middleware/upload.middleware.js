import multer from 'multer';
import ApiError from '../utils/ApiError.js';

/**
 * In-memory upload — buffers are handed to upload.service (Cloudinary placeholder).
 * Switch to diskStorage or streaming for very large files if needed.
 */
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (/^image\/(jpe?g|png|webp|avif)$/.test(file.mimetype)) return cb(null, true);
  return cb(ApiError.badRequest('Only JPEG, PNG, WEBP and AVIF images are allowed'), false);
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

export default uploadImages;
