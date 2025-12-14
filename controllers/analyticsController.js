const File = require('../models/fileModel');
const User = require('../models/userModel');

//! ANALYTICS FEATURE - Final Project Feature
const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user's files
        const userFiles = await File.find({ createdBy: userId });
        
        // Calculate analytics
        const totalFiles = userFiles.length;
        const totalDownloads = userFiles.reduce((sum, file) => sum + file.downloadCount, 0);
        const activeFiles = userFiles.filter(file => new Date(file.expiryTime) > new Date()).length;
        const expiredFiles = totalFiles - activeFiles;
        
        // File type distribution
        const fileTypes = {};
        userFiles.forEach(file => {
            const extension = file.filename.split('.').pop().toLowerCase();
            fileTypes[extension] = (fileTypes[extension] || 0) + 1;
        });
        
        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentFiles = userFiles.filter(file => new Date(file.uploadTime) >= sevenDaysAgo);
        
        // Daily upload trend
        const dailyUploads = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            dailyUploads[dateStr] = 0;
        }
        
        recentFiles.forEach(file => {
            const dateStr = new Date(file.uploadTime).toISOString().split('T')[0];
            if (dailyUploads[dateStr] !== undefined) {
                dailyUploads[dateStr]++;
            }
        });
        
        // Most downloaded files
        const topFiles = userFiles
            .sort((a, b) => b.downloadCount - a.downloadCount)
            .slice(0, 5)
            .map(file => ({
                filename: file.filename,
                downloadCount: file.downloadCount,
                uploadTime: file.uploadTime
            }));
        
        res.json({
            success: true,
            analytics: {
                overview: {
                    totalFiles,
                    totalDownloads,
                    activeFiles,
                    expiredFiles
                },
                fileTypes,
                dailyUploads,
                topFiles,
                recentActivity: recentFiles.length
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Failed to fetch analytics' 
        });
    }
};

const getFileActivity = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fileId } = req.params;
        
        const file = await File.findOne({ 
            _id: fileId, 
            createdBy: userId 
        });
        
        if (!file) {
            return res.status(404).json({ 
                success: false, 
                msg: 'File not found' 
            });
        }
        
        // Simulate activity log (you can enhance this with actual logging)
        const activityLog = [
            {
                action: 'uploaded',
                timestamp: file.uploadTime,
                details: 'File uploaded successfully'
            }
        ];
        
        if (file.downloadCount > 0) {
            activityLog.push({
                action: 'downloaded',
                timestamp: new Date(file.uploadTime.getTime() + 60000), // Simulate download time
                details: `Downloaded ${file.downloadCount} time${file.downloadCount > 1 ? 's' : ''}`
            });
        }
        
        res.json({
            success: true,
            file: {
                filename: file.filename,
                uploadTime: file.uploadTime,
                expiryTime: file.expiryTime,
                downloadCount: file.downloadCount,
                activityLog
            }
        });
    } catch (error) {
        console.error('File activity error:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Failed to fetch file activity' 
        });
    }
};

module.exports = {
    getAnalytics,
    getFileActivity
};