const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getQuestionsByQuiz,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController.js');
const { protect, restrictToAdminInstructor, restrictToCourseAccess } = require('../middlewares/authMiddleware');
const {validateQuestion} = require('../utils/validators/questionValidator');
const { validate } = require("../middlewares/validationMiddleware");


router.post(
  '/quizzes/:quizId/questions',
  protect,
  restrictToAdminInstructor,
  validateQuestion,
  validate,
  createQuestion
)
router.get('/quizzes/:quizId/questions', protect, getQuestionsByQuiz)
router.route("/:id")
      .get(protect,restrictToCourseAccess, getQuestionById)
      .put(protect,restrictToAdminInstructor,validateQuestion,validate,updateQuestion)
      .delete(protect,restrictToAdminInstructor, deleteQuestion);

module.exports = router