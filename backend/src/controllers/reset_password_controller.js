import bcrypt from "bcrypt";
import Users from "../models/user_schema.js";
import redis from "../config/redis.js";

// only handles forget pas , changePassword , forgetchangePassword
export const update_Password_controller = async(req , res) =>{

 try{
    const clearCookie = () =>{
      res.clearCookie("token", {
        httpOnly:true,
        secure:
        process.env.NODE_ENV === "production",
        sameSite:"none"
      });
    }

     console.log("===== update_Password_controller called =====");

     const passWord = req.body.passWord?.trim();
     const confirm_Password = req.body.confirm_Password?.trim();

     console.log("password received :", !!passWord);
     console.log("confirm password received :", !!confirm_Password);
     let email; let id;

     if(req.purpose === "changePassword" || req.purpose === "forgetPasswordforChangepassword"){
        email = req.email ;
        id = req.userId ;
     }
     else{
       ({email,id} = req.data );
     }

     // required fields
     if(!passWord || !confirm_Password){
        return res.status(400).json({
           status:false,
           message:"All fields are required"
        });
     }

     // password match
     if(passWord !== confirm_Password){
       return res.status(400).json({
          status: false,
          message : "Send equal password"
       });
     }

     const passWordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|]).{8,64}$/;

     // regex validation
     if(!passWordRegex.test(passWord)){
       return res.status(400).json({
          status: false,
          message : "Invalid password"
       });
     }

     // req.data validation
     if(!email || !id){
       return res.status(400).json({
          status: false,
          message : "Invalid data"
       });
     }

     let user ;

     if(req.purpose === "changePassword" || req.purpose === "forgetPasswordforChangepassword"){

      // now extract the token and than check your token session is valid or not if valid than extract user id from that and than extract your id using cookie and than match both if both same than  update and del that token redus
      // first check ki user middelware se hoke aaya hai previous
      const token = req.body.token ; let session ;

      if(req.purpose === "forgetPasswordforChangepassword"){
        session = await redis.get(`forgetPasswordforChangepassword:${token}`) ;
      }
      else{
        // now match with redis
        session = await redis.get(`changePassword:${token}`);
      }

      if(!session){
         return res.status(401).json({
            status:false,
            message:"token expired or invalid"
         });
      }
      // when session exists
      else{
        // now extract user id and also now extract  id from dbs and match both
        const data = JSON.parse(session);

       if(data.userId !== id ){
         // now we will be reurn / means he has anyone others token came with
         return res.status(403).json({
            status : false , message :"token mismatch"
         })
       }
       // when that is same
       else{
         // now find user using there userId
         user = await Users.findById(id) ;
       }
      }
     }
     else{
        user = await Users.findOne({ email });
     }

     console.log("User found :", !!user);

     // user not found
     if(!user){
        return res.status(404).json({
           status:false,
           message:"User not found"
        });
     }

     console.log("Checking old password match...");

      const isSame = await bcrypt.compare(
               passWord,
               user.passWord
      );

     if(isSame){
        return res.status(400).json({
           status : false,
           message: "Enter different password"
        });
     }

     const hash_Password = await bcrypt.hash(passWord, 12);

     user.passWord = hash_Password;
     await user.save();
     let purpose = "forgetPassword" ;

    if(req.purpose === "changePassword"){
       // now simply return user and also delete there key
       await redis.del(`passwordChange:${token}`) ;
       purpose = "changePassword"
    }
    else if(req.purpose === "forgetPasswordforChangepassword"){
       // now simply return user and also delete there key
       await redis.del(`forgetPasswordforChangepassword:${token}`) ;
       purpose = "forgetPasswordforChangepassword"
       clearCookie() ;
    }
    else{
      await redis.del(`key:${id}`);
      clearCookie() ;
    }

   return res.status(200).json({
      status: true,
      purpose: purpose,
      message:"Password updated successfully",
      email:email
   });
  }
  catch(err){
     return res.status(500).json({
         status : false,
         message :"Internal server error"
     });
  }
}