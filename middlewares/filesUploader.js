const path = require("path")

const multer = require("multer")

// Photo Storage

const photoStorage = multer.diskStorage({

    destination : function (req,file,cb){
        cb(null, path.join(__dirname,"../upload/images"))
    },

    filename : function (req,file,cb){
        if(file){
            cb(null,new Date().toISOString().replace(/:/g,"-")+file.originalname)
        }else{
            cb(null,false)
        }
    }
})



// video Storage

// const videoStorage = multer.diskStorage({

//     destination : function (req,file,cb){
//         cb(null, path.join(__dirname,"../upload/videos"))
//     },

//     filename : function (req,file,cb){
//         if(file){
//             cb(null,new Date().toISOString().replace(/:/g,"-")+file.originalname)
//         }else{
//             cb(null,false)
//         }
//     }
// })



// photo Upload middleware

const photoUpload = multer({

    storage : photoStorage,

    fileFilter : function(req,file,cb){
        if(file.mimetype.startsWith("image")){
            cb(null,true)
        }else{
            cb({message : "unsupported file format"},false)
        }
    },

    limits : {fileSize : 1024 * 1024 } //1 MB    // 1024 *1024 *5 = 5mb  // *n = n mb
})



// video Upload middleware

// const videoUpload = multer({

//     storage : videoStorage,

//     fileFilter : function(req,file,cb){
//         if(file.mimetype.startsWith("video")){
//             cb(null,true)
//         }else{
//             cb({message : "unsupported file format"},false)
//         }
//     },

//     limits : {fileSize :100 * 1024 * 1024 } //100 MB    // 1024 *1024 *5 = 5mb  // *n = n mb
// })




// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'upload/videos'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /mp4|avi|mov|mkv|webm/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed"));
  }
};

const videoUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});







module.exports = {photoUpload,videoUpload}