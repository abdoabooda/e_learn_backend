const express = require('express');
const router = express.Router();
const {
  getUserEnrollments,
  getCourseEnrollments,
  getEnrollmentById,
  deleteEnrollment,
  submitQuizScore
} = require('../controllers/enrollmentController.js');
const {
  protect,
  restrictToAdminInstructor,
  restrictToCourseAccess,
  restrictToSelf,
  restrictToSelfOrAdmin
} = require('../middlewares/authMiddleware.js');
// const {
//   validateProgressUpdate,
//   validateQuizScore,
// } = require('../utils/validators/enrollmentValidator.js');

const { validate } = require("../middlewares/validationMiddleware");


// router.post(
//   '/courses/:courseId',
//   restrictToSelf,
//   createEnrollment
// );

router.get('/user',protect,getUserEnrollments);
router.get('/courses/:courseId',protect, restrictToAdminInstructor, getCourseEnrollments);


router.route("/:enrollmentId")
     .get(protect,restrictToCourseAccess, getEnrollmentById)
    //  .put(
    //     restrictToAdminInstructor,
    //      validateProgressUpdate,
    //      validate,
    //      updateEnrollment
    //     )
     .delete(protect,restrictToSelfOrAdmin, deleteEnrollment);


router.post(
  '/:enrollmentId/quizzes/:quizId/quiz-score',
  protect,
  submitQuizScore
);

module.exports = router