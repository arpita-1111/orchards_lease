const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadImage } = require('../controllers/imageController');

// POST /api/images/upload
router.post('/upload', upload.single('image'), uploadImage);

module.exports = router;