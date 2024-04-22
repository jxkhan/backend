import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from './routes/user.routes.js '

const app = express();
app.use(
  cors({                                    //CORS allows servers to control access to their APIs, ensuring that only authorized clients can make requests
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json( ))    //accepting json data
app.use(express.urlencoded())
app.use(express.static("public"))   ///to store pdf file and images etc
app.use(cookieParser(  ))           // to access and the cookies of users browser from server

// routes import



//routes declaraton

app.use("/api/v1/users", userRouter)


export { app };
