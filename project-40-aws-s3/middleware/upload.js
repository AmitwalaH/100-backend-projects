const multer = require('multer');

// We use Memory Storage to keep the file in RAM temporarily.
// S3 expects the file as a 'Buffer' or 'Stream'.
const storage = multer.memoryStorage();

// Configure Multer
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB limit to prevent server overload
    },
    fileFilter: (req, file, cb) => {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, png, etc.) are allowed!'), false);
        }
    }
});

module.exports = upload;