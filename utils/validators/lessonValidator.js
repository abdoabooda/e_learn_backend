const { check } = require('express-validator');

exports.validateLesson = [
  check('title')
    .trim()
    .notEmpty()
    .withMessage('Lesson title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Lesson title must be between 3 and 100 characters'),
  check('duration')
    .notEmpty()
    .trim()
    .isLength({ min: 3, max: 100 }),
    
];