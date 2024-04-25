import { v2 as cloudinary } from "cloudinary";
import exp from "constants";
import fs from "fs"; //fileSystem to read write and remove file

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(cloudinary.config().cloud_name);

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // read file from public/temp

    // convert file intro base64 string

    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully
    // console.log("file is uploaded on cloudinary", response.url);


     fs.unlinkSync(localFilePath)
     return response;
  } catch (error) {
    console.log(error);
     fs.unlinkSync(loaclFilePath)  //remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

// cloudinary.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) {
//     console.log(result);
//   }
// );

export { uploadOnCloudinary };
