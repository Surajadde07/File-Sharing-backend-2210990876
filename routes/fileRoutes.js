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



router.get("/download/:uuid", isAuth, async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        
        if (!file) {
            return res.status(404).json({ msg: "File not found" });
        }

        if (new Date() > file.expiryTime) {
            return res.status(410).json({ msg: "File has expired" });
        }

        if (file.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Access denied. You can only download files you uploaded." });
        }

        if (!fs.existsSync(file.filePath)) {
            return res.status(404).json({ msg: "File not found on server" });
        }

        file.downloadCount += 1;
        await file.save();

        res.download(file.filePath, file.filename);
    } catch (err) {
        console.error("Download error:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

router.post("/share/:uuid", isAuth, async (req, res) => {
    try {
        const { recipientEmail } = req.body;
        const file = await File.findOne({ uuid: req.params.uuid });

        if (!file) {
            return res.status(404).json({ msg: "File not found" });
        }

        if (file.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Access denied" });
        }

        const downloadLink = `${process.env.BASE_URL || 'http://localhost:5000'}/api/files/download/${file.uuid}`;
        const subject = "You've received a file!";
        const html = `
        <h2>Hello,</h2>
        <p>You have received a file via File Sharing App.</p>
        <p><b>Filename:</b> ${file.filename}</p>
        <p><b>Expires:</b> ${file.expiryTime.toLocaleString()}</p>
        <a href="${downloadLink}">Click here to download</a>
        <br/><br/>
        <small>This link will expire in 24 hours.</small> 
    `;

        await sendEmail(recipientEmail, subject, html);

        file.receiverEmail = recipientEmail;
        await file.save();

        res.json({ message: "Download link sent successfully via email", file, recipientEmail, downloadLink });
    } catch (err) {
        console.error("Email share error:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

router.get("/info/:uuid", isAuth, async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });
        
        if (!file) {
            return res.status(404).json({ msg: "File not found" });
        }

        if (file.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: "Access denied. You can only view files you uploaded." });
        }

        res.json({
            filename: file.filename,
            uploadTime: file.uploadTime,
            expiryTime: file.expiryTime,
            downloadCount: file.downloadCount,
            expired: new Date() > file.expiryTime,
            createdBy: file.createdBy
        });
    } catch (err) {
        console.error("File info error:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});

router.get("/my-files", isAuth, async (req, res) => {
    try {
        const files = await File.find({ createdBy: req.user.id })
            .select('filename uuid uploadTime expiryTime downloadCount')
            .sort({ uploadTime: -1 });

        res.json({
            message: "Files retrieved successfully",
            count: files.length,
            files: files.map(file => ({
                id: file._id,
                uuid: file.uuid,
                filename: file.filename,
                uploadTime: file.uploadTime,
                expiryTime: file.expiryTime,
                downloadCount: file.downloadCount,
                expired: new Date() > file.expiryTime,
                downloadLink: `${process.env.BASE_URL || 'http://localhost:5000'}/api/files/download/${file.uuid}`
            }))
        });
    } catch (err) {
        console.error("My files error:", err);
        res.status(500).json({ msg: "Server error", error: err.message });
    }
});


module.exports = router;