// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleWebhook, verifyPayment,checkEnrollment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware.js');

router.post('/checkout', protect, createCheckoutSession);
//router.post('/webhook',express.raw({ type: 'application/json' }), handleWebhook); // put this api into app.js
router.get('/verify', protect, verifyPayment);
router.get('/check/:courseId', protect, checkEnrollment);

module.exports = router;