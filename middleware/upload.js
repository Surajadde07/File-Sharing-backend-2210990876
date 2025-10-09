const multer = require("multer");
const path = require("path");


//! TANISHA SECTION
//! UPDATED AND ALIGNED
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
        return cb(null, true);
    } else {
        cb("Error: Only images, PDFs, and ZIP files allowed!");
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;