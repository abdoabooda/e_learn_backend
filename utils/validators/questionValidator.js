const { check } = require('express-validator');

exports.validateQuestion = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Question name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Question name must be between 3 and 200 characters'),
  check('options')
    .isArray({ min: 2, max: 6 })
    .withMessage('Options must be an array with 2 to 6 items')
    .custom((options) => options.every((opt) => typeof opt === 'string' && opt.trim().length > 0))
    .withMessage('Each option must be a non-empty string'),
  check('correctAnswer')
    .trim()
    .notEmpty()
    .withMessage('Correct answer is required')
    .custom((correctAnswer, { req }) => req.body.options.includes(correctAnswer))
    .withMessage('Correct answer must be one of the provided options'),
];