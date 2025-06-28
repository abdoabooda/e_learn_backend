const asyncHandler = require('express-async-handler');
const User = require("../models/User.js");
const {cloudinaryUploadFile , cloudinaryRemoveFile} = require("../utils/cloudinary.js")
const path = require("path");
const fs = require("fs");
const Enrollment = require('../models/Enrollment');
const bcrypt = require('bcryptjs')
/**
 * @description  Get All Users
 * @route  /api/users/profile
 * @method  GET
 * @access private (only admin)
 */


exports.getAllUsers = asyncHandler(async(req,res)=>{
  const users = await User.find().select("-password");
  res.status(200).json(users)
})

/**
* @description  Get a User by id
* @route  /api/users/profile/:id
* @method  GET
* @access private (only admin or the user himself) 
*/


exports.getUser = asyncHandler(async(req,res)=>{
  const user = await User.findById(req.params.id).select("-password")
  if(!user){
    return res.status(404).json({message : "user not found"});
  }

  res.status(200).json(user);
})




/**
 * @description  Update a User by id
 * @route  /api/users/profile/:id
 * @method  PUT
 * @access private (only user himself) 
 */

exports.updateUser = asyncHandler(async(req,res)=>{

    if(req.body.password){
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password,salt)

    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id,{

        $set : {
            email    : req.body.email,
            userName : req.body.userName,
            password : req.body.password,
        }
    },{new : true}).select("-password");

    res.status(200).json(updatedUser)
})


/**
 * @description  Profile Photo Upload
 * @route  /api/users/profile/profile-photo-upload
 * @method  POST
 * @access private (only logged in user)
 */


exports.profilePhotoUpload = asyncHandler(async(req,res)=>{
    // 1- validation
    
    if(!req.file){
        return res.status(400).json({message : "No file provided"})
    }

    // 2- Get The Path To The Image

    const ImagePath = path.join(__dirname,`../upload/images/${req.file.filename}`)

    // 3- Upload to cloudinary

    const result = await cloudinaryUploadFile(ImagePath)
    //console.log(result)

    // 4- get the user from DB

    const user = await User.findById(req.user.id)
    // 5- delete the old profile photo if exists

    if(user.profilePhoto.publicId !== null){
        await cloudinaryRemoveFile(user.profilePhoto.publicId)
    }
    // 6- Change the profile photo field in the DB

    user.profilePhoto = {
        url : result.secure_url ,
        publicId : result.public_id
    }
    await user.save();

    // 7- send response to client

    res.status(200).json({
        message : "your photo uploaded successfully",
        profilePhoto : {
            url : result.secure_url ,
            publicId : result.public_id
        }
    })

    // 8- Remove image from the server (from 'images' folder)

    fs.unlinkSync(ImagePath)
})





/**
 * @description  Get Count Users
 * @route  /api/users/count
 * @method  GET
 * @access private (only admin)
 */


exports.getCountUsersCtrl = asyncHandler(async(req,res)=>{
    const count = await User.countDocuments()
    res.status(200).json(count)
})







exports.getStudentPerformance = asyncHandler(async (req, res) => {
  // Fetch enrollments with populated course and quiz (including virtual questions)
  const enrollments = await Enrollment.find({ user: req.user._id })
    .populate('course', 'title')
    .populate({
      path: 'quizScores.quiz',
      select: 'title duration',
      populate: {
        path: 'questions',
        select: 'name' // Minimal selection to count questions
      }
    })
    .lean();

  // Transform data for dashboard
  const data = enrollments.flatMap(enrollment =>
    enrollment.quizScores.map(score => {
      const totalQuestions = score.quiz?.questions?.length || 0;
      const percentageScore = totalQuestions > 0 ? (score.score / totalQuestions) * 100 : 0;
      return {
        courseTitle: enrollment.course?.title || 'Unknown',
        quizTitle: score.quiz?.title || 'Unknown',
        score: score.score || 0,
        timeUsed: score.timeUsed || 0,
        completedAt: score.completedAt ? new Date(score.completedAt).toISOString() : '',
        percentageScore: percentageScore.toFixed(2),
        passFail: percentageScore >= 60 ? 'Pass' : 'Fail',
        totalQuestions // Include for dashboard
      };
    })
  );

  res.json(data);
});



/**
 * @description  Delete user account
 * @route  /api/users/profile/:id
 * @method  DELETE
 * @access private (only admin or user himself)
 */