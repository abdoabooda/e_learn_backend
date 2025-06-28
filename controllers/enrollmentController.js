const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const User = require('../models/User')


/**
 * @desc    Enroll in a course
 * @route   /api/enrollments/courses/:courseId/enroll
 * @method  POST
 * @access  Private (student)
 */

// exports.createEnrollment = asyncHandler(async (req, res) => {
//   const { courseId } = req.params;
//   const userId = req.user._id;

//   // Validate course existence
//   const course = await Course.findById(courseId);
//   if (!course) {
//     return res.status(404).json({ message: 'Course not found' });
//   }

//   // Check if already enrolled
//   const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
//   if (existingEnrollment) {
//     return res.status(400).json({ message: 'User is already enrolled in this course' });
//   }

//   // Create enrollment
//   const enrollment = await Enrollment.create({
//     user: userId,
//     course: courseId
//   });

//   // Update course's enrolledStudents
//   await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: userId } });

//   res.status(201).json({
//     message: 'Enrolled successfully',
//     enrollment
//   });
// });


/**
 * @desc    Get all enrollments for a user
 * @route   /api/enrollments/user
 * @method  GET
 * @access  Private (student, instructor, admin)
 */

exports.getUserEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id })
    .populate('course')
    .populate({
      path: 'quizScores.quiz',
      select: 'title'
    });
  res.status(200).json({
    message: 'Enrollments retrieved successfully',
    enrollments
  });
});


/**
 * @desc    Get all enrollments for a course
 * @route   /api/enrollments/courses/:courseId
 * @method  GET
 * @access  Private (instructor, admin)
 */

exports.getCourseEnrollments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Validate course existence and authorization
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to view enrollments for this course' });
  }

  const enrollments = await Enrollment.find({ course: courseId })
    .populate('user', 'name email')
    .populate({
      path: 'quizScores.quiz',
      select: 'title'
    });
  res.status(200).json({
    message: 'Enrollments retrieved successfully',
    enrollments
  });
});

// @desc    Get a single enrollment
// @route   GET /api/enrollments/:enrollmentId
// @access  Private (student, instructor, admin)
exports.getEnrollmentById = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;

  const enrollment = await Enrollment.findById(enrollmentId)
    .populate('course', 'title description')
    .populate('user', 'name email')
    .populate({
      path: 'quizScores.quiz',
      select: 'title'
    });
  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  // Check authorization: user enrolled, course instructor, or admin
  if (
    req.user.role !== 'admin' &&
    enrollment.user._id.toString() !== req.user._id.toString() &&
    enrollment.course.instructor.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Not authorized to view this enrollment' });
  }

  res.status(200).json({
    message: 'Enrollment retrieved successfully',
    enrollment
  });
});

// @desc    Update enrollment (progress, completion)
// @route   PUT /api/enrollments/:enrollmentId
// @access  Private (instructor, admin)
// exports.updateEnrollment = asyncHandler(async (req, res) => {
//   const { enrollmentId } = req.params;
//   const { progress, completed } = req.body;

//   // Find enrollment and populate course
//   const enrollment = await Enrollment.findById(enrollmentId).populate('course');
//   if (!enrollment) {
//     return res.status(404).json({ message: 'Enrollment not found' });
//   }

//   // Check authorization: admin or course instructor
//   if (
//     req.user.role !== 'admin' &&
//     enrollment.course.instructor.toString() !== req.user._id.toString()
//   ) {
//     return res.status(403).json({ message: 'Not authorized to update this enrollment' });
//   }

//   // Update fields if provided
//   if (progress !== undefined) enrollment.progress = progress;
//   if (completed !== undefined) enrollment.completed = completed;

//   await enrollment.save();

//   res.status(200).json({
//     message: 'Enrollment updated successfully',
//     enrollment
//   });
// });

// @desc    Delete enrollment
// @route   DELETE /api/enrollments/:enrollmentId
// @access  Private (student, admin)
exports.deleteEnrollment = asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;

  // Find enrollment and populate course
  const enrollment = await Enrollment.findById(enrollmentId).populate('course');
  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  // Check authorization: enrolled user or admin
  if (req.user.role !== 'admin' && enrollment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this enrollment' });
  }

  // Remove user from course's enrolledStudents
  await Course.findByIdAndUpdate(enrollment.course._id, {
    $pull: { enrolledStudents: enrollment.user }
  });

  await enrollment.deleteOne();

  res.status(200).json({ message: 'Enrollment deleted successfully' });
});

// @desc    Submit quiz score
// @route   POST /api/enrollments/:enrollmentId/quizzes/:quizId/score
// @access  Private (student)
exports.submitQuizScore = asyncHandler(async (req, res) => {
  const { enrollmentId, quizId } = req.params;
  const { score,timeUsed } = req.body;

  // Find enrollment and populate course
  const enrollment = await Enrollment.findById(enrollmentId).populate('course');
  if (!enrollment) {
    return res.status(404).json({ message: 'Enrollment not found' });
  }

  // Check authorization: enrolled user
  if (enrollment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to submit score for this enrollment' });
  }

  // Validate quiz existence and ensure it belongs to the course
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  if (quiz.course.toString() !== enrollment.course._id.toString()) {
    return res.status(400).json({ message: 'Quiz does not belong to this course' });
  }

  const user = await User.findById(req.user._id)
    if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Check if quiz score already exists
  const existingScore = enrollment.quizScores.find(
    (qs) => qs.quiz.toString() === quizId
  );
  if (existingScore) {
    return res.status(400).json({ message: 'Quiz score already submitted' });
  }

  // Add quiz score
  enrollment.quizScores.push({
    quiz: quizId,
    score,
    timeUsed,
    completedAt: new Date()
  });

  await enrollment.save();


 user.quizScores.push({
    quiz: quizId,
    score,
    timeUsed,
    completedAt: new Date()
  });

  await user.save();

  res.status(200).json({
    message: 'Quiz score submitted successfully',
    enrollment
  });
});