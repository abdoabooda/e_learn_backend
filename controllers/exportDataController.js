const asyncHandler = require('express-async-handler');
const { parse } = require('json2csv');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');

exports.exportStudentPerformance = asyncHandler(async (req, res) => {
  // Fetch all enrollments with populated user and course
  const enrollments = await Enrollment.find()
    .populate('user', 'userName email')
    .populate('course', 'title')
    .lean();

  // Fetch all quizzes
  const quizzes = await Quiz.find().lean();

  // Transform data for CSV
  const data = enrollments.flatMap(enrollment =>
    enrollment.quizScores.map(score => {
      const quiz = quizzes.find(q => q._id.toString() === score.quiz.toString());
      const totalQuestions = quiz?.questions?.length || 0;
      const percentageScore = totalQuestions > 0 ? (score.score / totalQuestions) * 100 : 0;
      return {
        studentId: enrollment.user?._id || 'Unknown',
        studentName: enrollment.user?.userName || 'Unknown',
        studentEmail: enrollment.user?.email || 'Unknown',
        courseId: enrollment.course?._id || 'Unknown',
        courseTitle: enrollment.course?.title || 'Unknown',
        quizId: score.quiz || 'Unknown',
        quizTitle: quiz?.title || 'Unknown',
        score: score.score || 0,
        totalQuestions,
        duration: quiz?.duration || 5, // Default to 5 minutes if undefined
        timeUsed: score.timeUsed || 0,
        completedAt: score.completedAt ? score.completedAt.toISOString() : '',
        percentageScore: percentageScore.toFixed(2),
        passFail: percentageScore >= 60 ? 'Pass' : 'Fail'
      };
    })
  );

  // Define CSV fields
  const fields = [
    'studentId',
    'studentName',
    'studentEmail',
    'courseId',
    'courseTitle',
    'quizId',
    'quizTitle',
    'score',
    'totalQuestions',
    'duration',
    'timeUsed',
    'completedAt',
    'percentageScore',
    'passFail'
  ];

  // Generate CSV
  const csv = parse(data, { fields });

  // Set response headers for CSV download
  res.setHeader('Content-Disposition', 'attachment; filename=student_performance.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.status(200).send(csv);
});