const router = require("express").Router()

const { getAllUsers, getUser, updateUser, profilePhotoUpload,getCountUsersCtrl,getStudentPerformance,getInstructorStats,getInstructorCourses } = require("../controllers/usersController.js")
const {protect,restrictToAdminInstructor,restrictToSelf} = require("../middlewares/authMiddleware.js")
const validateObjectId = require("../middlewares/validateObjectId")
const {photoUpload} = require("../middlewares/filesUploader.js")


router.route("/profile").get(protect,restrictToAdminInstructor,getAllUsers)
                        .get(protect,getStudentPerformance)


router.route("/profile/:id")
      .get(validateObjectId,getUser)
      .put(validateObjectId,protect,restrictToSelf,updateUser)
     // .delete(validateObjectId,restrictToSelf,deleteUserProfileCtrl)



router.route("/profile/profile-photo-upload")
      .post(protect,photoUpload.single("image"),profilePhotoUpload)


router.route("/count").get(protect,restrictToAdminInstructor,getCountUsersCtrl)


router.get("/profile/dashboard/performance", protect, getStudentPerformance)

router.get("/dashboard/instructor", protect, getStudentPerformance)

router.get("/instructor/courses", protect, getStudentPerformance)




module.exports = router