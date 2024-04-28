import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js"


dotenv.config({        //dotenv: load environment variables from a special file.
  path: "./env",      //config: to load envirnoment variables
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 )
    console.log(`Server is running on port:  ${process.env.PORT}`)
})
.catch((err) => {
    console.log("MONGO db connection failed", err)
})


// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error",(error) => {
//         console.log("ERRR:", Error)
//         throw error
//     })

// app.listen(process.env.PORT, () =>{
//     console.log(`app is listening on port ${process.env.PORT}`)
// })

//   } catch (error) {
//     console.error("ERROR:", error);
//     throw err;
//   }
// })();
