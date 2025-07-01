const asyncHandler = require("express-async-handler")

const Quiz = require("../models/Quiz.js")

const Course = require("../models/Course.js")

const Enrollment = require('../models/Enrollment');


/**
 * @description  Create a new quiz
 * @route  /api/quizzes/courses/:courseId/quiz
 * @method  POST
 * @access private (only for admin or instructor)
 */

module.exports.createQuiz = asyncHandler(async(req,res)=>{

    // validation for data  (using express validator in routes)

    const { courseId } = req.params;

    // Validate course existence
    const course = await Course.findById(courseId);
     if (!course) {
      return res.status(404).json({ message: 'Course not found' });
     }


    // create new quiz and save it to DB

    const quiz = await Quiz.create({
    course: courseId,
    title:req.body.title,
    duration:req.body.duration,
    passingScore:req.body.passingScore
    });

    res.status(201).json({
    message: 'Quiz created successfully',
    quiz
  });

})



/**
 * @description  Get all quizzes
 * @route   /api/quizzes/courses/:courseId/quizzes
 * @method  GET
 * @access private (only for admin or instructor or enrolled student)
 */


exports.getAllQuizzes = asyncHandler(async(req,res)=>{

  const { courseId } = req.params;

  // Check if user is admin, instructor, or enrolled student
    const isEnrolled = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
      paymentStatus: 'completed',
    });
  
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'instructor' &&
      !isEnrolled) {
      return res.status(403).json({ message: 'Not authorized to view lessons for this course' });
    }

  const quizzes = await Quiz.find({ course: courseId }).populate('title')
                                                       .populate('questions')
                                                       .sort({ createdAt: 1 });

  res.status(200).json({
    message: 'Quizzes retrieved successfully',
    quizzes
  });
})




/**
 * @description  Get a quiz by id
 * @route  /api/quizzes/:id
 * @method  GET
 * @access private (for enrolled users,admins,instructor)
 */


exports.getQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const quiz = await Quiz.findById(quizId)
    .populate('course', 'title')
    .populate('questions', 'name options correctAnswer'); // Changed questionText to name
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  // Authorization done in restrictToCourseAccess middleware
  res.status(200).json({
    message: 'Quiz retrieved successfully',
    quiz
  });
});



/**
 * @description  Delete a quiz
 * @route  /api/quizzes/:id
 * @method  DELETE
 * @access private (only for admin or instructor)
 */


exports.deleteQuiz = asyncHandler(async(req,res)=>{
    const quiz = await Quiz.findById(req.params.id)
    if(!quiz){
        return res.status(404).json({message : "quiz Not Found"})
    }

    if(req.user.role.toLowerCase() !== 'admin' &&
    quiz.course.instructor.toString() !== req.user._id.toString()
  ){
        await Quiz.findByIdAndDelete(req.params.id)

        res.status(200).json({
            message : "quiz has been deleted successfully",
            quizId : quiz._id
        })
    }
    else{
        res.status(403).json({message : "access denied , forbidden"})
    }
})



/**
 * @description  Update a quiz
 * @route  /api/quizzes/:id
 * @method  PUT
 * @access private (only for admin or instructor)
 */



exports.updateQuiz = asyncHandler(async(req,res)=>{

    // 1. Get the quiz from the DB

    const quiz = await Quiz.findById(req.params.id);
    if(!quiz){
        return res.status(404).json({message : "quiz not found"})
    }

    // 2. check if the quiz belongs to the logged in user 
    if(req.user.role.toLowerCase() !== 'admin' &&
    quiz.course.instructor.toString() !== req.user._id.toString()
  ){
        return res.status(403).json({message : "access denied , you are not allowed"})
    }


    // 3. update quiz

    const updatedQuiz = await Course.findByIdAndUpdate(req.params.id,{
        $set : {
            title : req.body.title,
            passingScore : req.body.passingScore,
            duration: req.body.duration

        }
    },{new : true})

    // 4. send new quiz to the client

    res.status(200).json(updatedQuiz);
})
