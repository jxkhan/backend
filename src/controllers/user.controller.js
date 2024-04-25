import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import router from "../routes/user.routes.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

//get user detail from frontEnd
//validation not empty

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token"
    );
  }
};

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
    throw new ApiError(400, "Password is required ");
  }
  //if user already exists
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // checking for images
  const avatarLocalPath = req.files?.avatar[0]?.path; //receiving file from multer
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.lenght > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file path is required");
  }
  // upload images on cloudinary avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }

  const user = await User.create({
    fullName,
    userName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
  });

  // remove password and refresh token field from response

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  //return response

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));

  // if (
  //     [fullName , email , userName, password].some((field) =>
  //     field?.trim()=== "")
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  if (!userName && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Cridentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refershToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $ser: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});


const refreshAccessToken= asyncHandler(async(req,res) => {
const incomingRefreshToken= req.cookie.refreshToken || req.body.refreshToken

if(!incomingRefreshToken){
  throw new ApiError(401, "unautorized request")
}

try {
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )
  
  const user = await User.findById(decodedToken?._id)
  if(!user){
    throw new ApiError(401, " invalid refresh token")
  }
  
  if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401, "  refresh token is expired or used")
  }
  const options ={
    httpOnly: true,
    secure: true
  }
  
  const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newRefreshToken,options)
  .json(
    new ApiResponse(
      200,
      {accessToken, refreshToken: newRefreshToken},
      "access token refreshed Successfully"
    )
  )
  
} catch (error) {
  throw new ApiError(401, error?.message ||"Invalid Refresh Token")
  
}
})
export { registerUser, loginUser, logoutUser,refreshAccessToken };
