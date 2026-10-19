import Users from "../../models/user_schema.js";
import crypto from "crypto";
import redis from "../../config/redis.js";
import bcrypt from "bcrypt";
import transporter from "../../utils/mail_info.js";
import jwt from "jsonwebtoken";


// generate otp
export const generateOtp = () => {
   return crypto.randomInt(100000, 1000000).toString();
};

// hash otp
const hashOtp = async (otp) => {
   return await bcrypt.hash(otp, 10);
};

// =========================================
// EMAIL VERIFIER
// =========================================

export const emailVerifier = async (req, res, next) => {

   try {
      console.log("inside emial verifier") ;
      const email = req.body.email?.trim().toLowerCase();

      if(!email){
         return res.status(400).json({
            status:false,
            message:"Email required"
         });
      }
      console.log("befor signup check in emailverifer") ;

      // signup
      if(req.purpose === "signup"){
         console.log("inside the signup check");
         const userName = req.body.userName?.trim();
                  console.log("inside the signup check trim cross");

         const is_Email_exist = await Users.findOne({email});
                  console.log("inside the signup check email, cross");

         const is_Username_exist = await Users.findOne({userName});
         console.log("inside the signup check username cross");

         if(is_Email_exist){
            console.log("Email already registered");
            return res.status(409).json({
               status:false,
               error:"Emailalreadyregistered"
            });
         }

         if(is_Username_exist){
            console.log("Username already exists");
            return res.status(409).json({
               status:false,
               message:"Username already exists" ,
               error:"Usernamealreadyexists"
            });
         }
      }
      console.log("inside the email and befor forger passwod") ;
      console.log(req.body) ;
      console.log(req.purpose)  ;
      // forget password
      if(req.purpose === "forgetPassword"){

         const is_Email_exist = await Users.findOne({email});

         if(!is_Email_exist){
            console.log("Email not registered");
            return res.status(404).json({
               status:false,
               message:"Email not registered"
            });
         }
      }
      console.log("email check cross");

      next();

   }
   catch(err){
      return res.status(500).json({
         status:false,
         message:"Internal server error"
      });
   }
};


export const Otp_sender = async(req,res)=>{

   try{

      console.log("=================================");
      console.log("INSIDE OTP SENDER");
      console.log("Purpose :", req.purpose);
      console.log("=================================");

      let email;

      // protected flows
      if(
         req.purpose === "changeEmail" ||
         req.purpose === "changeEmailForgetPassword" ||
         req.purpose === "deleteAccount" ||
         req.purpose === "deleteAccountForgetPassword"||
         req.purpose === "forgetPasswordforChangepassword"
      ){
         console.log("Protected flow detected");
         email = req.email?.trim().toLowerCase();
         console.log("Email extracted from req.email :", email);
      }
      else{
         console.log("Public flow detected");
         email = req.body.email?.trim().toLowerCase();
         console.log("Email extracted from req.body :", email);
      }

      // email missing
      if(!email){
         console.log("Email missing");
         return res.status(400).json({
            status:false,
            message:"Email missing"
         });
      }

      const purpose = req.purpose;

      console.log("Purpose stored :", purpose);

      // redis keys
      const otpCountKey = `otp_count:${purpose}:${email}`;
      const blockedKey = `blocked:${purpose}:${email}`;
      const cooldownKey = `cooldown:${purpose}:${email}`;

      console.log("OTP COUNT KEY :", otpCountKey);
      console.log("BLOCK KEY :", blockedKey);
      console.log("COOLDOWN KEY :", cooldownKey);

      // blocked
      const isBlocked = await redis.exists(blockedKey);

      console.log("Blocked status :", isBlocked);

      if(isBlocked){
         console.log("User blocked for 24 hours");
         return res.status(429).json({
            status:false,
            message:"Maximum OTP limit reached. Try again after 24 hours.",
            code: "ACCOUNT_BLOCKED_24H",
         });
      }

      // cooldown
      const isCooldown = await redis.exists(cooldownKey);

      if(isCooldown){
         const ttl = await redis.ttl(cooldownKey);

         return res.status(429).json({
            status:false,
            message:
            `Wait ${ttl} seconds before requesting another OTP`,
            code: "OTP_COOLDOWN",
            retryAfter: ttl
         })
      }

      // count initialize
      const otpCountExists = await redis.exists(otpCountKey);

      console.log("OTP count exists :", otpCountExists);

      if(!otpCountExists){

         console.log("Initializing OTP count");

         await redis.hSet(otpCountKey,{
            count:1
         });

         await redis.expire(
            otpCountKey,
            86400
         );

         console.log("OTP count initialized");
      }
      else{

         console.log("Incrementing OTP count");

         await redis.hIncrBy(
            otpCountKey,
            "count",
            1
         );

         const data = await redis.hGetAll(otpCountKey);

         console.log("Updated OTP count :", data.count);

         if(Number(data.count) >= 5){

            console.log("OTP limit exceeded");

            await redis.setEx(
               blockedKey,
               86400,
               "blocked"
            );

            console.log("Blocked key created");

            return res.status(429).json({
               status:false,
               message:
               "Too many OTP requests. Blocked for 24 hours."
            });
         }
      }

      // generate otp
      console.log("Generating OTP");

      const plainOtp = generateOtp();

      console.log("Plain OTP :", plainOtp);

      const hashedOtp = await hashOtp(plainOtp);

      console.log("OTP hashed successfully");

      await redis.setEx(
         `otp:${purpose}:${email}`,
         120,
         hashedOtp
      );

      console.log("OTP stored in redis");

      // =====================================
      // STORE FLOW DATA
      // =====================================

      // signup
      if(req.purpose === "signup"){

         console.log("Signup flow data storing");

         const hashedPassword =
         await bcrypt.hash(
            req.body.passWord,
            10
         );

         console.log("Password hashed");

         await redis.setEx(
            `data:${purpose}:${email}`,
            900,
            JSON.stringify({
               userName:req.body.userName,
               fullName:req.body.fullName,
               email:req.body.email,
               passWord:hashedPassword
            })
         );
         console.log("Signup data stored in redis");
      }

      // forget password
      if(
         req.purpose === "forgetPassword" ||
         req.purpose === "changeEmailForgetPassword" ||
         req.purpose === "deleteAccountForgetPassword"||
         req.purpose === "forgetPasswordforChangepassword"
      ){

         console.log("Forget password related flow");

         await redis.setEx(
            `data:${purpose}:${email}`,
            900,
            JSON.stringify({
               email
            })
         );

         console.log("Forget password data stored");
      }

      // protected flows
      if(req.purpose === "changeEmail" ||req.purpose === "deleteAccount" ){

         console.log("Protected flow data storing");
         await redis.setEx(
            `data:${purpose}:${email}`,
            900,
            JSON.stringify({
               verified:true
            })
         );
         console.log("Protected flow data stored");
      }

     // otp sender when req comes
     if(req.purpose ==="resendOtp") {
         console.log("Resend OTP flow detected");

        // now check first for that purpose and email any combination is store
        const dataExists = await redis.exists(`data:${req.flow}:${email}`) ;

         // when data not exists
         if(!dataExists){
            console.log("No existing data found for this email and purpose") ;
             return res.status(400).json({
               status:false,
               message:"No existing data found for this email and purpose"
            });
         }
         // when data exists
         else{
            // now update the otp in that data
            console.log("Existing data found for this email and purpose") ;
            await redis.setEx(`otp:${req.flow}:${email}`,
               120,
               await hashOtp(plainOtp)
            ) ;
         }
     }

      // send email
      console.log("Sending OTP mail");

      await transporter.sendMail({
         from:
         `"TaskFlow Web" <${process.env.USER_EMAIL}>`,
         to:email,

         subject:"OTP Verification",

         html:`
         <h2>Email Verification</h2>

         <p>Your OTP is:</p>

         <h1>${plainOtp}</h1>

         <p>OTP valid for 2 minutes.</p>
         `
      });

      console.log("OTP mail sent successfully");

      // cooldown
      await redis.setEx(
         cooldownKey,
         60,
         "active"
      );

      console.log("Cooldown key created");

      console.log("OTP sender completed successfully");

      return res.status(200).json({
         status:true,
         message:"OTP sent successfully",
         email
      });
   }
   catch(err){
      console.log("=================================");
      console.log("OTP SENDER ERROR");
      console.log(err.message);
      console.log(err);
      console.log("=================================");

      return res.status(500).json({
         status:false,
         message:err.message
      });
   }
};

// =========================================
// OTP COMPARE
// =========================================

export const Otp_compare = async(req,res,next)=>{

   try{
      console.log(req.purpose) ;
      let email;

      if(
         req.purpose === "changeEmailForgetPassword" ||
         req.purpose === "deleteAccountForgetPassword" ||
         req.purpose === "forgetPasswordforChangepassword"
      ){
         email = req.email?.trim().toLowerCase();
      }
      else{
         email = req.body.email?.trim().toLowerCase();
      }

      if(!email){
         return res.status(400).json({
            status:false,
            message:"Email required"
         });
      }

      const purpose = req.purpose;
      const otp = req.body.otp?.trim();

      console.log(otp) ;
      console.log(typeof otp) ;
      console.log("Email :", email) ;
      console.log("Purpose :", purpose) ;

      if(!otp || !/^\d{6}$/.test(otp)){
         return res.status(400).json({
            status:false,
            message:"Invalid OTP format"
         });
      }

      // compare keys
      const compareAttemptKey = `compare_attempt:${purpose}:${email}`;
      const compareBlockedKey = `compare_blocked:${purpose}:${email}`;

      // blocked
      if(await redis.exists(compareBlockedKey)){
         return res.status(429).json({
            status:false,
            message:"Too many invalid OTP attempts"
         });
      }

      // get stored otp
      const storedOtp = await redis.get(
         `otp:${purpose}:${email}`
      );

      if(!storedOtp){
         return res.status(410).json({
            status:false,
            message:"OTP expired"
         });
      }

      // compare
      const isValid = await bcrypt.compare(
         otp,
         storedOtp
      );

      // invalid otp
      if(!isValid){

         if(!(await redis.exists(compareAttemptKey))){

            await redis.hSet(compareAttemptKey,{
               attempt:1
            });

            await redis.expire(compareAttemptKey,86400);
         }
         else{

            await redis.hIncrBy(
               compareAttemptKey,
               "attempt",
               1
            );

            const data = await redis.hGetAll(compareAttemptKey);

            if(Number(data.attempt) >= 25){

               await redis.setEx(
                  compareBlockedKey,
                  86400,
                  "blocked"
               );

               return res.status(429).json({
                  status:false,
                  message:"Too many invalid OTP attempts"
               });
            }
         }

         return res.status(401).json({
            status:false,
            message:"Invalid OTP"
         });
      }

      // success
      await redis.del(`otp:${purpose}:${email}`);

      await redis.del(compareAttemptKey);
      await redis.del(compareBlockedKey);

      // signup
      if(req.purpose === "signup"){

         const data = await redis.get(
            `data:${purpose}:${email}`
         );
         req.data = JSON.parse(data);
         await redis.del(`data:${purpose}:${email}`);
         return next();
      }

      // forget password
      if(req.purpose === "forgetPassword"){
         const jti = crypto.randomBytes(16).toString("hex");

         const token = jwt.sign(
            {
               purpose:"resetPassword",
               jwt_Id:jti
            },
            process.env.JWT_SECRET,
            {
               expiresIn:"15m"
            }
         );
         await redis.setEx(
            `key:${jti}`,
            900,
            JSON.stringify({
               email,
               purpose
            })
         );

         return res.status(200).json({
            status:true,
            message:"OTP verified successfully",
            token,
            purpose: "forgetPassword",
         });
      }

      // protected flows
      if(
         req.purpose === "changeEmail" ||
         req.purpose === "changeEmailForgetPassword" ||
         req.purpose === "deleteAccount" ||
         req.purpose === "deleteAccountForgetPassword"||
         req.purpose === "forgetPasswordforChangepassword"
      ){
         const token = req.cookies.token;

         if(!token){
            return res.status(401).json({
               status:false,
               message:"Unauthorized"
            });
         }

         const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
         );

         req.userId = decoded.id;
         req.isVerified = true;
         return next();
      }
   }
   catch(err){
      return res.status(500).json({
         status:false,
         message:err.message
      });
   }
};