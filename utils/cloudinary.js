const cloudinary = require("cloudinary").v2  // Use the v2 signature to avoid confusion.

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})


// Cloudinary Upload file 

const cloudinaryUploadFile = async(fileToUpload)=>{

    try {
        const data = await cloudinary.uploader.upload(fileToUpload,{
            resource_type : 'auto',
        })
        return data
    } catch (error) {
        console.log(error)
        throw new Error("Internal server error (cloudinary)")
    }
}


// Cloudinary Remove file 

const cloudinaryRemoveFile = async(filePublicId)=>{

    try {
        const result = await cloudinary.uploader.destroy(filePublicId)
        return result;
    } catch (error) {
        console.log(error)
        throw new Error("Internal server error (cloudinary)")
    }
}


// Cloudinary Remove Multiple files 

const cloudinaryRemoveMultipleFiles = async(publicIds)=>{

    try {
        const result = await cloudinary.v2.api.delete_resources(publicIds)
        return result;
    } catch (error) {
        console.log(error)
        throw new Error("Internal server error (cloudinary)")
    }
}

module.exports = {
    cloudinary,
    cloudinaryUploadFile,
    cloudinaryRemoveFile,
    cloudinaryRemoveMultipleFiles
}