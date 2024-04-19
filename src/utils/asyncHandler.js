const asyncHandler = (requestHandler) => {              //asyncHandler function is used to simplify error handling in asynchronous request handlers
    (req,res,next) =>{                                  //Asynchronous programming is commonly used in web development for handling network requests, file I/O operations, database queries, and other tasks that involve waiting for external resources to respond.                
        Promise.resolve(requestHandler(req,res,next)).  //Promises provide a more structured way of handling asynchronous operations, allowing for better error handling and chaining of asynchronous tasks.
        catch((err) => next(err))
    }
}



export {asyncHandler} 