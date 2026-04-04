const express = require('express');
const router = express.Router();
const { submitFeedback, getAdminMetrics,getFeedbackByCourse,checkFeedback } = require('../controllers/feedbackController');

// POST /api/feedback
router.post('/', submitFeedback);

// GET /api/feedback/admin-metrics
router.get('/admin-metrics', getAdminMetrics);
router.get('/course/:courseId', getFeedbackByCourse);
router.get('/check', checkFeedback);

module.exports = router;
