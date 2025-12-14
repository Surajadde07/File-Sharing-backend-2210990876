const express = require('express');
const { getAnalytics, getFileActivity } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user analytics dashboard
router.get('/', auth, getAnalytics);

// Get specific file activity
router.get('/file/:fileId', auth, getFileActivity);

module.exports = router ;