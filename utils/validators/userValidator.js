const { check } = require('express-validator');




exports.updateUsersValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  check("userName")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject("Email already exists");
        }
      })
    ),
  
];