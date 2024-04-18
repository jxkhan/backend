class ApiError extends Error{
    constructor(
        statusCode,
        message="something went wrong",
        error=[],
        statck="",

    ){
        super(message)                 //super is construtor of parent class and message is parameter
        this.statusCode=statusCode     //This property is used to store the HTTP status code associated with the error.
        this.data=null                 //to store additional data related to the error if needed
        this.message=message
        this.success=false             //This property can be used to indicate whether an operation or request associated with the error was successful or not.
        this.errors= errors       // assign a property called errors.
        
        if(statck){
            this.stack=statck
        } else{
            Error.captureStackTrace(this,this.constructor)
        }
    
    
    
    }
}
export {ApiError}