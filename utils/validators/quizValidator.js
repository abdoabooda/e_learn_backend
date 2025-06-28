const { check } = require('express-validator');



exports.validateQuiz = [
  check('title')
    .trim()
    .notEmpty()
    .withMessage('Quiz title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Quiz title must be between 3 and 100 characters'),
  check('duration')
    .isInt({ min: 1, max: 180 })
    .withMessage('Duration must be between 1 and 180 minutes'),
  check('passingScore')
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
    
];


