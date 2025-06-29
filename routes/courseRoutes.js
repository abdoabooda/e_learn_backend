const express = require("express");

const router = express.Router();

const {restrictToAdminInstructor,protect} = require("../middlewares/authMiddleware");

const { createCourse , getAllCourses,getCourse,updateCourse,deleteCourse,getCountCoursesCtrl,getInstructorCourses,updateCourseImage } = require("../controllers/coursesController");

const {photoUpload} = require("../middlewares/filesUploader")

const {createCourseValidtor} = require("../utils/validators/courseValidator")

const { validate } = require("../middlewares/validationMiddleware");


router.post("/",protect,restrictToAdminInstructor,photoUpload.single("image"),createCourseValidtor,validate,createCourse)

router.route("/").get(getAllCourses)

router.get("/instructor",protect,restrictToAdminInstructor,getInstructorCourses)

router.route("/count").get(protect,restrictToAdminInstructor,getCountCoursesCtrl)

router.route("/:id")
      .get(getCourse)
      .put(protect,restrictToAdminInstructor,updateCourse)
      .delete(protect,restrictToAdminInstructor,deleteCourse)

router.route("/update-image/:id")
      .put(protect,restrictToAdminInstructor,photoUpload.single("image"),updateCourseImage)


module.exports = router