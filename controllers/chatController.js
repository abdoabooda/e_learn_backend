const asynchandler = require("express-async-handler")
const Chat = require("../models/Chat.js")
const Conversation = require("../models/Conversation.js")
const {cloudinary} = require('../utils/cloudinary.js')
const { run } = require('../utils/gemini');

/**
 * @description  Create New chat
 * @route  /api/chats/
 * @method  POST
 * @access private
 */
exports.createChat = asynchandler(async(req,res)=>{

    const userId = req.user._id

    const chat = await Chat.create({
        user : userId,
    })
    
    res.status(200).json(chat)

});



/**
 * @description  Get all chats
 * @route  /api/chats
 * @method  GET
 * @access private
 */
exports.getAllChats = asynchandler(async(req,res)=>{
    const chats = await Chat.find({user:req.user._id}).sort({
        createdAt: -1
    });

    res.status(200).json(chats);

});

/**
 * @description  Create new conversation
 * @route  /api/chats/:id
 * @method  POST
 * @access private
*/

exports.addConversation = asynchandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  if (!chat) {
    return res.status(404).json({ message: 'No Chat with this id' });
  }

  const { question } = req.body;
  const image = req.file; // Assuming multer assigns the file to req.file

  let questionImage = null;
  let answer = '';

  if (image) {
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(image.buffer);
    });

    const imageUrl = uploadResult.secure_url;
    const cloudinaryId = uploadResult.public_id;

    // Process image with Google Cloud Vision API
    const [textResult] = await visionClient.textDetection(image.buffer);
    const detectedText = textResult.textAnnotations[0]?.description || 'No text detected';

    const [labelResult] = await visionClient.labelDetection(image.buffer);
    const labels = labelResult.labelAnnotations.map((label) => label.description).join(', ') || 'No labels detected';

    const description = `Text: ${detectedText}\nLabels: ${labels}`;

    questionImage = {
      url: imageUrl,
      cloudinaryId,
      description,
    };

    // Use gemini-1.5-flash via run for a conversational response if question exists
    if (question) {
      const prompt = `${question}\n\nImage Analysis:\n${description}`;
      answer = await run(prompt);
    } else {
      answer = description; // Default to Vision API output if no question
    }
  } else if (question) {
    // Text-only prompt with gemini-1.5-flash via run
    answer = await run(question);
  }

  // Create conversation
  const conversation = await Conversation.create({
    chat: chat._id,
    question,
    questionImage,
    answer,
  });

  // Update Chat with latest message
  const updatedChat = await Chat.findByIdAndUpdate(
    req.params.id,
    { latestMessage: question || 'Image uploaded' },
    { new: true }
  );

  res.status(200).json({
    conversation,
    updatedChat,
  });
});


/**
 * @description  Get a conversation
 * @route  /api/chats/:id
 * @method  GET
 * @access private
*/
exports.getConversation = asynchandler(async(req,res)=>{
    const conversation = await Conversation.find({chat : req.params.id})

    if(!conversation){
        res.status(404).json({message:"No conversation with this id"})
    }

    res.status(200).json(conversation);
});


/**
 * @description  Delete a chat
 * @route  /api/chats/:id
 * @method  DELETE
 * @access private
*/

exports.deleteChat = asynchandler(async(req,res)=>{

    const chat = await Chat.findById(req.params.id)

    if(!chat){
        res.status(404).json({message:"No Chat with this id"})
    }

    if(chat.user.toString() !== req.user._id.toString())
        return res.status(403).json({
            message : "unauthorized"
        })

    await Chat.findByIdAndDelete(req.params.id);

    res.status(200).json({
        message : "Chat has been deleted successfully"
    })

});


