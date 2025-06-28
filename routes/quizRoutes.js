const express = require('express');

const router = express.Router();

const {
  createQuiz,
  getAllQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quizController.js');

const {exportStudentPerformance} = require('../controllers/exportDataController.js');

const { protect,restrictToAdminInstructor, restrictToCourseAccess } = require('../middlewares/authMiddleware');
const  {validateQuiz} = require('../utils/validators/quizValidator');
const { validate } = require("../middlewares/validationMiddleware");

router.post('/courses/:courseId/quiz',
    protect,
    restrictToAdminInstructor,
    validateQuiz,
    validate,
     createQuiz
    );
router.get('/courses/:courseId/quizzes', protect,restrictToCourseAccess, getAllQuizzes)
router.get('/courses/:courseId/quizzes/:quizId', protect, restrictToCourseAccess, getQuiz);
router.route("/:id")
      .put(protect,restrictToAdminInstructor,validateQuiz, validate, updateQuiz)
      .delete(protect,restrictToAdminInstructor, deleteQuiz)

router.get('/export/performance', exportStudentPerformance);

module.exports = router