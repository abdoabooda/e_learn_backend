const { check } = require('express-validator');



exports.validateProgressUpdate = [
  check('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  check('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean'),
    
];

exports.validateQuizScore = [
  check('score')
    .isInt({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
    
];
