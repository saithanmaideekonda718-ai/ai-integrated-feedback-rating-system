const express = require('express');
const router = express.Router();
const { submitFeedback, getAdminMetrics } = require('../controllers/feedbackController');

// POST /api/feedback
router.post('/', submitFeedback);

// GET /api/feedback/admin-metrics
router.get('/admin-metrics', getAdminMetrics);

module.exports = router;
