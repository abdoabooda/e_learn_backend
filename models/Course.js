const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true, 
      trim: true
    },
    description: {
      type: String,
      required: true   
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    courseImg : {
      type : Object,
      default :{
          url : "https://cache.careers360.mobi/media/article_images/2021/8/9/Online-courses-after-10th.jpg",
          publicId : null,
      },
  },
    price: {
      type: Number,
      required: true, 
      min: 0
    },
    duration: {
      type: Number, // in hours
      required: true
    },
    category:{
      type: String,
      required: true,
      enum: ['programming', 'design', 'business']
    },
    enrolledStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    ratings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String
    }],
  },{
    timestamps: true
  });
  

  const Course = mongoose.model('Course', courseSchema);

  module.exports = Course;