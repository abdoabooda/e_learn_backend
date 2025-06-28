const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    options:[
        {
            type:String,
            required:true,
        }
    ],
    correctAnswer:{
        type:Number,
        required:true,
    },
    quiz:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Quiz',
        required:true,
    },
},
{timestamps:true});

const Question = mongoose.model('Questions',questionSchema);

module.exports = Question;