const express = require('express');
const router = express.Router();
const {
  sendResetCode,
  verifyResetCode,
  resetPassword
} = require('../controllers/passwordController');

router.post('/forgot-password', sendResetCode);
router.post('/verify-code', verifyResetCode);
router.post('/reset-password', resetPassword);

module.exports = router;
