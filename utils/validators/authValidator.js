const { check } = require('express-validator');

exports.registerValidator = [
  check('userName')
    .trim()
    .notEmpty()
    .withMessage('userName is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('userName must be between 2 and 50 characters'),
  check('email')
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage('Please provide a valid email'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
    
];



exports.loginValidator = [
check('email')
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email"),
    check('password')
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
    
];