const asyncHandler = require("express-async-handler")

const Lesson = require("../models/Lesson.js")

const Course = require("../models/Course.js")

const Enrollment = require('../models/Enrollment');

const {cloudinaryUploadFile} = require('../utils/cloudinary');

const fs = require('fs');

const path = require('path')



/**
 * @description  Create a new lesson
 * @route  /api/lessons/courses/:courseId/lessons
 * @method  POST
 * @access private (only for admin or instructor)
 */


exports.newLesson = asyncHandler(async (req, res) => {
  // 1. Validate video file
  if (!req.file) {
    return res.status(400).json({ message: 'No video file provided' });
  }

  // 2. Validate courseId from req.body
  const { courseId } = req.params;
  if (!courseId) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Course ID is required' });
  }

  // 3. Validate course existence and authorization
  const course = await Course.findById(courseId);
  if (!course) {
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ message: 'Course not found' });
  }
  if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
    fs.unlinkSync(req.file.path);
    return res.status(403).json({ message: 'Not authorized to add lesson to this course' });
  }

  // 4. Upload video to Cloudinary
  const videoPath = path.join(__dirname,`../upload/videos/${req.file.filename}`)
  const result = await cloudinaryUploadFile(videoPath)

  // 5. Create new lesson and save to DB
  const lesson = await Lesson.create({
    title: req.body.title,
    duration: req.body.duration,
    videoUrl: {
      url: result.secure_url,
      publicId: result.public_id
    },
    course: course._id
  });

      // 6. Send response to the client
      res.status(201).json({
          success : true,
          message : "Lesson created successfully",
          lesson
      });
  
      // 7 remove video from the server 
      fs.unlinkSync(videoPath)
  
})



/**
 * @description  Get all lessons
 * @route  /api/lessons/courses/:courseId/lessons
 * @method  GET
 * @access private (for enrolled users)
 */


exports.getAllLessons = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Validate course existence
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
// Check if user is admin, instructor, or enrolled student
  const isEnrolled = await Enrollment.findOne({
    user: req.user._id,
    course: courseId,
    paymentStatus: 'completed',
  });

  if (
    req.user.role !== 'admin' &&
    course.instructor.toString() !== req.user._id.toString() &&
    !isEnrolled) {
    return res.status(403).json({ message: 'Not authorized to view lessons for this course' });
  }

  const lessons = await Lesson.find({ course: courseId }).sort({ createdAt: 1 });

  res.status(200).json({
    message: 'Lessons retrieved successfully',
    lessons
  });
});
/**
 * @description  Get a lesson by id
 * @route  /api/lessons/:id
 * @method  GET
 * @access private (for enrolled users)
 */


exports.getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('course');
  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }

  // Check authorization: admin, course instructor, or enrolled student
  if (
    req.user.role !== 'admin' &&
    lesson.course.instructor.toString() !== req.user._id.toString() &&
    !(await Enrollment.findOne({ user: req.user._id, course: lesson.course._id }))
  ) {
    return res.status(403).json({ message: 'Not authorized to view this lesson' });
  }

  res.status(200).json({
    message: 'Lesson retrieved successfully',
    lesson
  });
});



/**
 * @description  Delete a lesson
 * @route  /api/lessons/:id
 * @method  DELETE
 * @access private (only for admin or instructor)
 */


exports.deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id).populate('course');
  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }

  // Check if user is admin or the course instructor
  if (
    req.user.role !== 'admin' &&
    lesson.course.instructor.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Access denied, forbidden' });
  }

  // Delete video from Uploadcare if it exists
  if (lesson.videoUrl?.publicId) {
    try {
      await deleteFile({ uuid: lesson.videoUrl.publicId }, { authSchema: restClient });
      console.log(`Deleted Uploadcare file: ${lesson.videoUrl.publicId}`);
    } catch (error) {
      console.error('Uploadcare delete error:', error);
      return res.status(500).json({ message: 'Failed to delete video from Uploadcare', error: error.message });
    }
  }

  // Delete the lesson
  await Lesson.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: 'Lesson deleted successfully',
    lessonId: lesson._id
  });
});



/**
 * @description  Update a lesson
 * @route  /api/lessons/:id
 * @method  PUT
 * @access private (only for admin or instructor)
 */



exports.updateLesson = asyncHandler(async(req,res)=>{

    // 1. Get the lesson from the DB

    const lesson = await Lesson.findById(req.params.id);
    if(!lesson){
        return res.status(404).json({message : "lesson not found"})
    }

    // 2. check if the lesson belongs to the logged in user 
    if(req.user.id !== lesson.course.instructor.toString() || req.user.role !== 'admin'){
        return res.status(403).json({message : "access denied , you are not allowed"})
    }


    // 3. update lesson

    const updatedLesson = await Course.findByIdAndUpdate(req.params.id,{
        $set : {
            title : req.body.title,
            content : req.body.content,
            duration: req.body.duration

        }
    },{new : true})

    // 4. send new lesson to the client

    res.status(200).json(updatedLesson);
})

