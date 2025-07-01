const asyncHandler = require('express-async-handler');
const User = require("../models/User.js");
const {cloudinaryUploadFile , cloudinaryRemoveFile} = require("../utils/cloudinary.js")
const path = require("path");
const fs = require("fs");
const Enrollment = require('../models/Enrollment');
const bcrypt = require('bcryptjs')
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');


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



/**
 * @description  Get Student's stats
 * @route  /api/users/profile/dashboard/performance
 * @method  GET
 * @access private (logged in user)
 */



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
 * @description  Get Instructor stats
 * @route  /api/users/dashboard/instructor
 * @method  GET
 * @access private (only instructor)
 */

exports.getInstructorStats = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  const [courses, enrollments, quizzes] = await Promise.all([
    Course.find({ instructor: instructorId }).lean(),
    Enrollment.find({ course: { $in: await Course.find({ instructor: instructorId }).distinct('_id') } }).lean(),
    Quiz.find({ course: { $in: await Course.find({ instructor: instructorId }).distinct('_id') } }).lean()
  ]);

  const totalCourses = courses.length;
  const totalStudents = enrollments.length;
  const completionRate = enrollments.length > 0
    ? Math.round((enrollments.filter(e => e.progress >= 100).length / enrollments.length) * 100)
    : 0;
  const revenue = enrollments.reduce((sum, e) => sum + (e.coursePrice || 0), 0);
  const activeQuizzes = quizzes.length;
  const avgRating = courses.length > 0
    ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
    : 0;

  const recentActivity = enrollments
    .slice(0, 5)
    .map((e, index) => ({
      id: index + 1,
      type: e.progress >= 100 ? 'completion' : 'enrollment',
      description: `${e.userName || 'Student'} ${e.progress >= 100 ? 'completed' : 'enrolled in'} ${e.courseTitle || 'a course'}`,
      timestamp: e.createdAt || new Date()
    }))
    .concat(
      quizzes.slice(0, 3).map((q, index) => ({
        id: enrollments.length + index + 1,
        type: 'quiz_submission',
        description: `New submission for quiz "${q.title}"`,
        timestamp: q.createdAt || new Date()
      }))
    );

  res.json({
    totalCourses,
    totalStudents,
    completionRate,
    revenue,
    recentActivity,
    activeQuizzes,
    avgRating
  });
});


/**
 * @description  Get instructor courses
 * @route  /api/users/instructor/courses
 * @method  GET
 * @access private (only instructor)
 */

exports.getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id })
    .select('title level duration enrolledStudents price status')
    .lean();
  res.json(courses.map(c => ({
    id: c._id,
    title: c.title,
    level: c.level,
    duration: c.duration,
    enrolledStudents: c.enrolledStudents || 0,
    price: c.price || 0,
    status: c.status || 'Active'
  })));
});









/**
 * @description  Delete user account
 * @route  /api/users/profile/:id
 * @method  DELETE
 * @access private (only admin or user himself)
 */