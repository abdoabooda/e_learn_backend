const asyncHandler = require("express-async-handler")

const Course = require("../models/Course.js")

const fs = require("fs")

const path = require("path")

const {cloudinaryUploadFile, cloudinaryRemoveFile} = require("../utils/cloudinary")


/**
 * @description  Create a new course
 * @route  /api/courses/
 * @method  POST
 * @access private (only for admin or instructor)
 */


exports.createCourse = asyncHandler(async (req, res) => {
    // 1. validation for image
    if(!req.file){
            return res.status(400).json({message : "No image provided"})
         }

    // 2. validation for data (using express validator in routes file)

    // 3. upload image to cloudinary
    const imagePath = path.join(__dirname,`../upload/images/${req.file.filename}`)
    const result = await cloudinaryUploadFile(imagePath)

    // 4. create new course and save it to DB

    const course = await Course.create({
        title : req.body.title,
        description : req.body.description,
        category : req.body.category,
        instructor : req.user._id,
        courseImg : {
            public_id : result.public_id,
            url : result.secure_url
        },
        price : req.body.price,
        duration : req.body.duration,
    })
    // 5. Send response to the client
    res.status(201).json({
        success : true,
        message : "Course created successfully",
        course
    });

    // 6. remove image from the server 
    fs.unlinkSync(imagePath)

})


/**
 * @description  Get all courses
 * @route  /api/courses
 * @method  GET
 * @access public
 */


exports.getAllCourses = asyncHandler(async (req, res) => {

    const courses = await Course.find().populate("instructor",["-password"])
    res.status(200).json({
        success : true,
        courses
    });
    
})


/**
 * @description  Get a course by id
 * @route  /api/courses/:id
 * @method  GET
 * @access public
 */

exports.getCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id).populate("instructor",["-password"])
    if(!course){
        return res.status(404).json({
            success : false,
            message : "Course not found"
        })
    }
    res.status(200).json({
        success : true,
        course
    }); 
})




/**
 * @description  Update a course by id
 * @route  /api/courses/:id
 * @method  PUT
 * @access private (only for admin or instructor)
 */


exports.updateCourse = asyncHandler(async(req,res)=>{

    // 1. Get the course from the DB

    const course = await Course.findById(req.params.id);
    if(!course){
        return res.status(404).json({message : "course not found"})
    }

    // 2. check if the course belongs to the logged in user 
    if(req.user.id !== course.instructor.toString() || req.user.role !== 'admin'){
        return res.status(403).json({message : "access denied , you are not allowed"})
    }


    // 3. update course

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id,{
        $set : {
            title : req.body.title,
            description : req.body.description,
            category : req.body.category,
            price : req.body.price,
            duration: req.body.duration

        }
    },{new : true})

    // 4. send new course to the client

    res.status(200).json(updatedCourse);
})



/**
 * @description  Delete a course by id
 * @route  /api/courses/:id
 * @method  Delete
 * @access private (only for admin)
 */

exports.deleteCourse = asyncHandler(async(req,res)=>{

    const course = await Course.findById(req.params.id)
    if(!course){
        return res.status(404).json({message : "Course Not Found"})
    }
    
    if(req.user.id === course.instructor.toString() || req.user.role === 'admin'){
        await Course.findByIdAndDelete(req.params.id)
        await cloudinaryRemoveFile(course.image.publicId)

        // delete all lessons of the course

       // await Comment.deleteMany({courseId : course._id})

       // delete all quizzes of the course

       // await Comment.deleteMany({courseId : course._id})


        res.status(200).json({
            message : "course has been deleted successfully",
            courseId : course._id
        })
    }
    else{
        res.status(403).json({message : "access denied , forbidden"})
    }
})




/**
 * @description  Get Count courses
 * @route  /api/courses/count
 * @method  GET
 * @access private (only admin)
 */


exports.getCountCoursesCtrl = asyncHandler(async(req,res)=>{
    const count = await Course.countDocuments()
    res.status(200).json(count)
})
