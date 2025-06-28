const { check } = require('express-validator');


exports.createCourseValidtor=[

    check('title')
    .trim()
    .notEmpty()
    .withMessage('title is required')
    .isLength({ min: 2, max: 500 }),

    check('description')
    .trim()
    .notEmpty()
    .withMessage('description is required')
    .isLength({ min: 6, max: 120 }),


    // check('instructor')
    // .trim()
    // .notEmpty()
    // .withMessage('instructor is required'),

    check("price")
    .notEmpty()
    .withMessage("Course's price is required")
    .isNumeric()
    .withMessage("Course's price must be a number")
    .isLength({ max: 32 })
    .withMessage("Too long product price"),


    check("duration")
    .notEmpty()
    .withMessage("course's duration is required")
    .isNumeric()
    .withMessage("course's duration must be a number")
    .isLength({ max: 32 })
    .withMessage("Too long product price"),

    check('category')
    .trim()
    .notEmpty()
    .withMessage('category is required'),
    
]