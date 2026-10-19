import Users from "../../models/user_schema.js";
import bcrypt from "bcrypt";

const Login_middleware = async(req,res,next)=>{

    const body = req.body ;
    const userName = body.userName ;
    const passWord = body.passWord ;
    const userExistence = await Users.findOne({ userName }).select("+passWord");

    if(userExistence === null){ // means user not exist
        return res.status(404).json({
          status:false , message : "user does not exist"
        })
    }
    else{ // means user exist
      // now match the passsword
      // now check first syntax of username and password strongly
      const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

     if(!usernameRegex.test(userName)){
        return res.status(400).json({
            status :false, message :"invalid Username"
        })
     }
     if(!passwordRegex.test(passWord)){
         return res.status(400).json({
            status : false, message :"invalid Password"
         })
     }
      const isMatched = await bcrypt.compare(passWord,userExistence.passWord) ;

        if(!isMatched){
            return res.status(400).json({
              status:false ,   message:"Invalid password"
            }) ;
        }
        else{
           req.isVerified = true ;
           req.user = userExistence;
           next() ;// calling to controller for checking user existence and password matching
        }
    }
}
export default Login_middleware  ;