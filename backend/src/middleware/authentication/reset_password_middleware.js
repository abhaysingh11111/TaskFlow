import redis from "../../config/redis.js";
import jwt from "jsonwebtoken";

const Reset_password_middleware = async(req, res , next)=>{

 try{

   console.log("===== Reset_password_middleware called =====");

   const token = req.body.token;

   console.log("token received :", token ? "YES" : "NO");

   if(!token){
     console.log("Token missing");

     return res.status(400).json({
        status: false,
        message: "Token required"
     });
   }

   let is_Verified_token;

   try{

     console.log("Verifying JWT token...");

     is_Verified_token = jwt.verify(
        token,
        process.env.JWT_SECRET
     );

     console.log("JWT verified successfully");
     console.log("JWT payload :", is_Verified_token);

   }
   catch(err){

     console.log("JWT verify failed");
     console.log(err.message);

     return res.status(401).json({
          message : "session expired",
          status : false
     });
   }

   const id = is_Verified_token.jwt_Id;

   console.log("jwt_Id :", id);

   if(!id){

      console.log("jwt_Id missing in token payload");

      return res.status(401).json({
         status:false,
         message:"Invalid token payload"
      });
   }

   console.log(`Fetching Redis key => key:${id}`);

   const data = await redis.get(`key:${id}`);

   console.log("Redis data :", data);

   if(!data){

       console.log("Redis session expired");

       return res.status(401).json({
           message : "session expired",
           status : false
       });
   }

   const parse_Data = JSON.parse(data);

   console.log("Parsed Redis data :", parse_Data);

   const email = parse_Data.email;

   console.log("Email from Redis :", email);

   if(!email){

      console.log("Email missing in Redis data");

      return res.status(401).json({
         status:false,
         message:"Invalid session data"
      });
   }

   req.data = { email, id };

   console.log("req.data set :", req.data);
   console.log("Middleware passed successfully");

   return next();

 }
 catch(err){

     console.log("===== Middleware Error =====");
     console.log(err);
     console.log(err.message);

     return res.status(500).json({
         status : false,
         message :"internal server error"
     });
 }
}

export default Reset_password_middleware;