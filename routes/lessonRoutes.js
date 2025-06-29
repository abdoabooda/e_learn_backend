const express = require("express");

const router = express.Router();

const {protect,restrictToAdminInstructor,restrictToCourseAccess,restrictToAdmin,restrictToInstructor} = require("../middlewares/authMiddleware");

const { newLesson , getAllLessons ,getLesson ,updateLesson ,deleteLesson
      ,updateLessonVideo, getAllLessonsAdmin, getInstructorLessons,} = require("../controllers/lessonController");

const {validateLesson} = require("../utils/validators/lessonValidator")

const { validate } = require("../middlewares/validationMiddleware");

const {videoUpload} = require("../middlewares/filesUploader")

router.route("/courses/:courseId/lessons")
      .post(protect,restrictToAdminInstructor,videoUpload.single("video"),validateLesson,validate,newLesson)
      .get(protect,restrictToCourseAccess,getAllLessons);

router.get("/admin", protect, restrictToAdmin,getAllLessonsAdmin);

router.get("/instructor", protect, restrictToInstructor,getInstructorLessons);

router.route("/:id")
      .get(protect,restrictToCourseAccess,getLesson)
      .put(protect,restrictToAdminInstructor,validateLesson,validate,updateLesson)
      .delete(protect,restrictToAdminInstructor,deleteLesson)


router.route("/update-video/:id")
      .put(protect,restrictToAdminInstructor,videoUpload.single("video"),updateLessonVideo)






module.exports = router

