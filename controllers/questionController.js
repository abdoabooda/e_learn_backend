const asyncHandler = require('express-async-handler');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');


/**
 * @desc    Create a new question
 * @route   /api/questions/
 * @method  POST 
 * @access  Private (instructor, admin)
 */

exports.createQuestion = asyncHandler(async (req, res) => {
  
  const { name, options, correctAnswer,quizId } = req.body;

  // Validate quiz existence
  const quiz = await Quiz.findById(quizId).populate('course');
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  // Check authorization: admin or instructor of the course
  if (req.user.role !== 'admin' && quiz.course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to create question for this quiz' });
  }

  // Create and save question
  const question = await Question.create({
    name,
    options,
    correctAnswer,
    quiz: quizId
  });

  res.status(201).json({
    message: 'Question created successfully',
    question
  });
});

/**
 * @desc    Get all questions for a quiz
 * @route   /api/questions/quizzes/:quizId/questions
 * @method  GET 
 * @access  Private (instructor, admin, student)
 */

exports.getQuestionsByQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  // Validate quiz existence
  const quiz = await Quiz.findById(quizId).populate('course');
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  //Check authorization: admin, instructor of the course, or enrolled student
  if (
    req.user.role !== 'admin' &&
    quiz.course.instructor.toString() !== req.user._id.toString() &&
    !(await Course.findOne({ _id: quiz.course._id, enrolledStudents: req.user._id }))
  ) {
    return res.status(403).json({ message: 'Not authorized to view questions for this quiz' });
  }

  const questions = await Question.find({ quiz: quizId })
  res.status(200).json({
    message: 'Questions retrieved successfully',
    questions
  });
});


/** 
* @desc    Get a single question
* @route   /api/questions/:questionId
* @method  GET
* @access  Private (instructor, admin, student)
*/

exports.getQuestionById = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  const question = await Question.findById(questionId).populate({
    path: 'quiz',
    populate: { path: 'course' }
  });
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }

  // Check authorization: admin, instructor of the course, or enrolled student
  if (
    req.user.role !== 'admin' &&
    question.quiz.course.instructor.toString() !== req.user._id.toString() &&
    !(await Course.findOne({ _id: question.quiz.course._id, enrolledStudents: req.user._id }))
  ) {
    return res.status(403).json({ message: 'Not authorized to view this question' });
  }

  // Exclude correctAnswer for students
  if (req.user.role === 'student') {
    const { correctAnswer, ...questionData } = question.toObject();
    return res.status(200).json({
      message: 'Question retrieved successfully',
      question: questionData
    });
  }

  res.status(200).json({
    message: 'Question retrieved successfully',
    question
  });
});



/**
 * @desc    Update a question
 * @route   /api/questions/:questionId
 * @method  PUT
 * @access  Private (instructor, admin)
 */


exports.updateQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { name, options, correctAnswer } = req.body;

  // Find question and populate quiz and course
  const question = await Question.findById(questionId).populate({
    path: 'quiz',
    populate: { path: 'course' }
  });
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }

  // Check authorization: admin or instructor of the course
  if (
    req.user.role !== 'admin' &&
    question.quiz.course.instructor.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized to update this question' });
  }

  // Update fields if provided
  if (name) question.name = name;
  if (options) question.options = options;
  if (correctAnswer) question.correctAnswer = correctAnswer;

  await question.save();

  res.status(200).json({
    message: 'Question updated successfully',
    question
  });

});


/**
 * @desc    Delete a question
 * @route   /api/questions/:questionId
 * @method  DELETE
 * @access  Private (instructor, admin)
 */


exports.deleteQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  // Find question and populate quiz and course
  const question = await Question.findById(questionId).populate({
    path: 'quiz',
    populate: { path: 'course' }
  });
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }

  // Check authorization: admin or instructor of the course
  if (
    req.user.role !== 'admin' &&
    question.quiz.course.instructor.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized to delete this question' });
  }

  await question.deleteOne();

  res.status(200).json({ message: 'Question deleted successfully' });
});
