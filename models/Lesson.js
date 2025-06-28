const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true, 'Lesson title is required'],
        trim:true,
    },
    videoUrl:{
        type : Object,
        default :{
            url : "https://cache.careers360.mobi/media/article_images/2021/8/9/Online-courses-after-10th.jpg",
            publicId : null,
        },
    },
    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    duration:{
        type:String,
        required:true
    },
    },
    {timestamps:true}
);

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;