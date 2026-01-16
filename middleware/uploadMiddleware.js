const multer = require('multer');

// Configure storage (memory storage for processing)
const storage = multer.memoryStorage();

// File filter (optional, check for excel/csv)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheetml') || file.mimetype.includes('csv')) {
        cb(null, true);
    } else {
        cb(new Error('Please upload only Excel or CSV files.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
