const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const File = require("../models/fileModel");
const isAuth = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const sendEmail = require("../utils/sendEmail");

//! TANISHA SECTION
//! UPDATED AND ALIGNED
router.post("/upload", isAuth, upload.single("file"), async (req, res) => {
    try {
        console.log("=== FILE UPLOAD DEBUG ===");
        console.log("req.user:", req.user);
        console.log("req.file:", req.file);
        
        if (!req.file) {
            return res.status(400).json({ msg: "No file uploaded" });
        }

        const file = new File({
            filename: req.file.originalname,
            filePath: req.file.path,
            uuid: uuidv4(),
            expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            createdBy: req.user.id,
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


//! TANEY SECTION
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

        const downloadLink = `${process.env.BASE_URL || 'http://localhost:5000'}/api/files/file/${file.uuid}`;
        const directDownloadLink = `${process.env.BASE_URL || 'http://localhost:5000'}/api/files/download/${file.uuid}`;
        const subject = "📁 You've received a file!";
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: #3498db; color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .file-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db; }
                .download-btn { display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .download-btn:hover { background: #2980b9; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #7f8c8d; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📁 WeShare</h1>
                    <p>You've received a file!</p>
                </div>
                <div class="content">
                    <h2>Hello!</h2>
                    <p>Someone has shared a file with you through our secure file sharing platform.</p>
                    
                    <div class="file-info">
                        <h3>📄 File Details</h3>
                        <p><strong>Filename:</strong> ${file.filename}</p>
                        <p><strong>Uploaded:</strong> ${file.uploadTime.toLocaleString()}</p>
                        <p><strong>Expires:</strong> ${file.expiryTime.toLocaleString()}</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${downloadLink}" class="download-btn">
                            🔗 View & Download File
                        </a>
                        <br>
                        <small>or</small>
                        <br>
                        <a href="${directDownloadLink}" style="color: #3498db;">Direct Download Link</a>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Important:</strong> This file will expire in 24 hours from upload time for security purposes. Please download it before it expires.
                    </div>
                    
                    <p style="font-size: 14px; color: #7f8c8d;">
                        If you have any issues downloading the file, please contact the sender.
                    </p>
                </div>
                <div class="footer">
                    <p>This email was sent from WeShare - Secure File Sharing Platform</p>
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
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

//! SOUBHAGYA SECTION
// Public download route (no auth required, uses UUID for security)
router.get("/download/:uuid", async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });

        if (!file) {
            return res.status(404).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h2>File Not Found</h2>
                        <p>The file you're looking for doesn't exist or has been removed.</p>
                    </body>
                </html>
            `);
        }

        if (new Date() > file.expiryTime) {
            return res.status(410).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h2>File Expired</h2>
                        <p>This file has expired and is no longer available for download.</p>
                        <p>Expired on: ${file.expiryTime.toLocaleString()}</p>
                    </body>
                </html>
            `);
        }

        if (!fs.existsSync(file.filePath)) {
            return res.status(404).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h2>File Not Found</h2>
                        <p>The file is not available on the server.</p>
                    </body>
                </html>
            `);
        }

        // Increment download count
        file.downloadCount += 1;
        await file.save();

        // Set proper headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Send the file for download
        res.download(file.filePath, file.filename, (err) => {
            if (err) {
                console.error("Download error:", err);
                if (!res.headersSent) {
                    res.status(500).send(`
                        <html>
                            <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                                <h2>Download Error</h2>
                                <p>An error occurred while downloading the file.</p>
                            </body>
                        </html>
                    `);
                }
            }
        });
    } catch (err) {
        console.error("Download error:", err);
        res.status(500).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                    <h2>Server Error</h2>
                    <p>An error occurred while processing your request.</p>
                </body>
            </html>
        `);
    }
});

// Authenticated download route for logged-in users
router.get("/secure-download/:uuid", isAuth, async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });

        if (!file) {
            return res.status(404).json({ msg: "File not found" });
        }

        if (new Date() > file.expiryTime) {
            return res.status(410).json({ msg: "File has expired" });
        }

        if (file.createdBy.toString() !== req.user.id && req.user.email !== file.receiverEmail) {
            return res.status(403).json({ msg: "Access denied. You are not the recipient or uploader." });
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

// Public file info and download page
router.get("/file/:uuid", async (req, res) => {
    try {
        const file = await File.findOne({ uuid: req.params.uuid });

        if (!file) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>File Not Found</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                        .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                        .error { color: #e74c3c; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2 class="error">File Not Found</h2>
                        <p>The file you're looking for doesn't exist or has been removed.</p>
                    </div>
                </body>
                </html>
            `);
        }

        const isExpired = new Date() > file.expiryTime;
        const fileExists = fs.existsSync(file.filePath);

        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Download ${file.filename}</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { font-size: 24px; font-weight: bold; color: #3498db; margin-bottom: 10px; }
                    .file-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .file-name { font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; word-break: break-all; }
                    .file-details { color: #7f8c8d; font-size: 14px; }
                    .download-btn { background: #3498db; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; text-decoration: none; display: inline-block; margin: 20px 0; }
                    .download-btn:hover { background: #2980b9; }
                    .download-btn:disabled { background: #bdc3c7; cursor: not-allowed; }
                    .expired { color: #e74c3c; }
                    .success { color: #27ae60; }
                    .stats { display: flex; justify-content: space-between; margin-top: 20px; }
                    .stat { text-align: center; }
                    .stat-number { font-size: 20px; font-weight: bold; color: #3498db; }
                    .stat-label { font-size: 12px; color: #7f8c8d; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">📁 WeShare</div>
                        <h2>File Download</h2>
                    </div>
                    
                    <div class="file-info">
                        <div class="file-name">📄 ${file.filename}</div>
                        <div class="file-details">
                            <p><strong>Uploaded:</strong> ${file.uploadTime.toLocaleString()}</p>
                            <p><strong>Expires:</strong> ${file.expiryTime.toLocaleString()}</p>
                            <p class="${isExpired ? 'expired' : 'success'}">
                                <strong>Status:</strong> ${isExpired ? '❌ Expired' : '✅ Available'}
                            </p>
                        </div>
                        
                        <div class="stats">
                            <div class="stat">
                                <div class="stat-number">${file.downloadCount}</div>
                                <div class="stat-label">Downloads</div>
                            </div>
                            <div class="stat">
                                <div class="stat-number">${Math.max(0, Math.ceil((file.expiryTime - new Date()) / (1000 * 60 * 60)))}h</div>
                                <div class="stat-label">${isExpired ? 'Expired' : 'Remaining'}</div>
                            </div>
                        </div>
                    </div>
                    
                    ${!isExpired && fileExists ? `
                        <div style="text-align: center;">
                            <a href="/api/files/download/${file.uuid}" class="download-btn">
                                ⬇️ Download File
                            </a>
                            <p style="font-size: 12px; color: #7f8c8d;">
                                Click the button above to download the file securely.
                            </p>
                        </div>
                    ` : `
                        <div style="text-align: center;">
                            <button class="download-btn" disabled>
                                ${isExpired ? '❌ File Expired' : '❌ File Not Available'}
                            </button>
                            <p style="font-size: 12px; color: #e74c3c;">
                                ${isExpired ? 'This file has expired and is no longer available for download.' : 'This file is not available on the server.'}
                            </p>
                        </div>
                    `}
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                        <p style="font-size: 12px; color: #7f8c8d;">
                            Powered by WeShare - Secure File Sharing Platform
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        console.error("File info error:", err);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Error</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 50px auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                    .error { color: #e74c3c; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2 class="error">Server Error</h2>
                    <p>An error occurred while processing your request.</p>
                </div>
            </body>
            </html>
        `);
    }
});


module.exports = router;