const mongoose = require("mongoose");


const Chatschema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    latestMessage:{
        type:String,
        default:"New Chat"
    },
},
{
    timestamps:true
}
)

// Chat model
const Chat = mongoose.model("Chat",Chatschema);

module.exports = Chat
