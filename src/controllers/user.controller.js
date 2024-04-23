import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import router from "../routes/user.routes.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse} from "../utils/apiResponse.js"


//get user detail from frontEnd
//validation not empty


const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;
  if (fullName === "") {
    throw new ApiError(400, "Full Name is required ");
  }
  if (email === "") {
    throw new ApiError(400, "email is required ");
  }
  if (userName === "") {
    throw new ApiError(400, "User Name  is required ");
  }
  if (password === "") {
    throw new ApiError(400, "Passwprd is required ");
  }

  const existedUser = User.findOne({
    $or: [{ userName }, { email }],
  });


  //if user already exists
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }


  // checking for images
  const avatarLocalPath = req.files?.avatar[0]?.path; //receiving file from multer
  const coverImageLocalPath = req.files?.coverImage[0]?.path; 

  if (!avatarLocalPath) {
    throw new ApiError(400 , "Avatar file is required")
    
  }
  // upload images on cloudinary avatar
  const avatar =await uploadOnCloudinary(avatarLocalPath)
  const coverImage =await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "avatar file is required")
    
  }

    const user= await  User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
  })

  // remove password and refresh token field from response

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   //check for user creation
   if (createdUser) {
    throw new ApiError(500, "something went wrong while registering the user")
    
   }

   //return response

   return res.status(201).json(
    new ApiResponse(200, createdUser, "user registered successfully")
   )

  // if (
  //     [fullName , email , userName, password].some((field) =>
  //     field?.trim()=== "")
});

export { registerUser };
