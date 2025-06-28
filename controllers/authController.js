const asyncHandler = require('express-async-handler');
const User = require("../models/User.js");

/**
 * @description  Register New User
 * @route  /api/auth/register
 * @method  POST
 * @access public
 */

exports.registerUser = asyncHandler(async (req, res) => {
    const { userName, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const user = await User.create({
        userName,
        email,
        password,
        role
      });
    
      if (user) {
    
        res.status(201).json({message : "you registred successfully, please log in"});
      } else {
        res.status(400);
        throw new Error('Invalid user data');
      }
    });



/**
 * @description  Login User
 * @route  /api/auth/login
 * @method  POST
 * @access public
 */

exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
  
    if (user && (await user.comparePassword(password))) {
      const token = user.generateAuthToken()
  
      res.status(200).json({
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role:user.role,
        token
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
});








