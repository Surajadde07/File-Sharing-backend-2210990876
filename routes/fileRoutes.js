const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const File = require("../models/fileModel");
const isAuth = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

// Upload file (Authentication required)
router.post("/upload", isAuth, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: "No file uploaded" });
        }

        const file = new File({
            filename: req.file.originalname,
            filePath: req.file.path,
            uuid: uuidv4(),
            expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            createdBy: req.user.id, // Link file to authenticated user
        });

        await file.save();

        res.json({
            message: "File uploaded successfully",
            file: {
                id: file._id,
                uuid: file.uuid,
                filename: file.filename,
                uploadTime: file.uploadTime,
                expiryTime: file.expiryTime,
                downloadLink: `${process.env.BASE_URL || 'http://localhost:5000'}/api/files/download/${file.uuid}`,
            },
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

module.exports = router;