const express = require("express");

const router = express.Router();

const {protect,restrictToAdminInstructor,restrictToCourseAccess} = require("../middlewares/authMiddleware");

const { newLesson , getAllLessons ,getLesson ,updateLesson ,deleteLesson,updateLessonVideo} = require("../controllers/lessonController");

const {validateLesson} = require("../utils/validators/lessonValidator")

const { validate } = require("../middlewares/validationMiddleware");

const {videoUpload} = require("../middlewares/filesUploader")

router.post("/courses/:courseId/lessons",protect,restrictToAdminInstructor,videoUpload.single("video"),validateLesson,validate,newLesson)

router.get('/courses/:courseId/lessons',protect,restrictToCourseAccess,getAllLessons);

router.route("/:id")
      .get(protect,restrictToCourseAccess,getLesson)
      .put(protect,restrictToAdminInstructor,validateLesson,validate,updateLesson)
      .delete(protect,restrictToAdminInstructor,deleteLesson)


router.route("/update-video/:id")
      .put(protect,restrictToAdminInstructor,videoUpload.single("video"),updateLessonVideo)



module.exports = router

