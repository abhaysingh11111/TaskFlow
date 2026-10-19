import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../models/user_schema.js";
import redis from "../../config/redis.js";
import { v4 as uuidv4 } from "uuid";

export const password_Compare = async (req, res, next) => {

   // password regex
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
   const inputPassword = req.body.password?.trim();

   // validate password syntax
   if (!inputPassword || !passwordRegex.test(inputPassword)) {
      console.log("inside password regex");

      return res.status(400).json({
         status: false,
         message: "Invalid password syntax"
      });
   }

   try {

      if(req.purpose === "ChangePassword"){
         /// now check ki email attached hai or hacker attacked this route
         const email = req.email ;
         if(!email){ // when email not link with req body
           return res.status().json({
              status : false , message :"Email is missing user is unauthorized"
           })
         }
      }

      const browserToken = req.cookies.token;

      // token missing
      if(!browserToken) {
         return res.status(401).json({
            status: false,
            message: "Token missing"
         })
      }

      // verify jwt
      const decoded = jwt.verify(
         browserToken,
         process.env.JWT_SECRET
      );

      console.log("token decoded cross");

      // attach userId to req
      req.userId = decoded.id;

      console.log("req.userId :", req.userId);

      // find user
      const user = await User
         .findById(req.userId)
         .select("+passWord");

      console.log("user find cross");

      // user not found
      if(!user){
         return res.status(404).json({
            status: false,
            message: "User not found"
         });
      }

      // compare password
      const isMatch = await bcrypt.compare(
         inputPassword,
         user.passWord
      );

      console.log("ismatch cross");

      // password mismatch
      if (!isMatch) {
         return res.status(401).json({
            status: false,
            message: "Password mismatch"
         });
      }

      console.log("password matched successfully");

      // delete account flow
      if (req.purpose === "deleteAccount") {
         return next();
      }

      // generate temporary token
      const token = uuidv4();

      // but jab agar password match kar jaaye and flow ChangePassword ho than redis me data hold karo and frontnd koo send kare
      if(req.purpose === "ChangePassword"){
        // now hold in redis for 15 minutes and send to frontend
         await redis.set(`passwordChange:${token}`,
             JSON.stringify({
               userId: req.userId
             }),
             "EX",
             900
         );

        return res.status(200).json({
          status: true ,token,
          message: "Password matched successfully",
        });
      }

      // store in redis for 15 min
      await redis.set(
         `emailChange:${token}`,
         JSON.stringify({
            userId: req.userId
         }),
         "EX",
         900
      );

      console.log("temporary redis token stored");

      return res.status(200).json({
         status: true,
         token,
         message: "Password matched successfully",
      });

   }
   catch (err) {
      console.log(err.message);

      // jwt errors
      if (err.name === "JsonWebTokenError" ||err.name === "TokenExpiredError") {
         return res.status(401).json({
            status: false,
            message: "Invalid or expired token"
         })
      }

      return res.status(500).json({
         status: false,
         message: "Internal server error",
      });
   }
};