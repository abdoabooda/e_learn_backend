const express = require('express');

const router = express.Router();

const {
  loginUser,
  registerUser,
} = require('../controllers/authController.js');

const {registerValidator,loginValidator} = require('../utils/validators/authValidator.js')

const { validate } = require("../middlewares/validationMiddleware");

router.post('/register', registerValidator, validate,registerUser);
router.post('/login', loginValidator, validate,loginUser);


module.exports = router


