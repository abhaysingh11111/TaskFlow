import jwt from "jsonwebtoken";
import crypto from "crypto";
import redis from "../config/redis.js";

export const  changeEmail_Accdel_forPass_flow_DataSave= async(req, res) => {

   const userId = req.userId;
   const token = req.cookies.token;
   const isVerified = req.isVerified;
   const email = req.email;

   // unauthorized
   if(!userId || !token || !isVerified || !email){
      return res.status(401).json({
         status:false,
         message:"Unauthorized",
         purpose:"delAcc and changeEmail"
      })
   }

   try{
      // unique session id
      const jwt_Id = crypto.randomUUID();

      // reset token
      const resetToken = jwt.sign(
         {
            jwt_Id,
            purpose:"reset_Password"
         },
         process.env.JWT_SECRET,
         {
            expiresIn:"20m"
         }
      );

      if(req.purpose === "forgetPasswordforChangepassword"){
        // save session in redis
        await redis.setEx(`forgetPasswordforChangepassword:${jwt_Id}`,
          1200,
          JSON.stringify({
             userId,
             email
          })
        );
      }
      else{
        // save session in redis
        await redis.setEx(`key:${jwt_Id}`,
          1200,
          JSON.stringify({
             userId,
             email
          })
        );
      }

      return res.status(200).json({
         status:true,
         message:"Verification successful",
         token:resetToken,
         purpose:req.purpose
      });
   }
   catch(err){

      console.log(err.message);

      return res.status(500).json({

         status:false,

         message:"Internal server error"
      });
   }
}
