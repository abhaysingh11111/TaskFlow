import express from "express"
import { emailVerifier } from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";
import { Otp_sender } from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";
import { Otp_compare } from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";
import {update_Password_controller} from "../../controllers/reset_password_controller.js";
import Reset_password_middleware from "../../middleware/authentication/reset_password_middleware.js";

const router = express.Router() ;

router.post("/forgetPassword",(req,res,next)=>{
    req.purpose = "forgetPassword" ;
    next() ;
},emailVerifier,Otp_sender) ;

// yha pe otp compare dena hai
router.post("/forgetPassword/otpCompare",(req,res,next)=>{
    req.purpose = "forgetPassword" ;
    next() ;
},Otp_compare) ;

// update password route
router.post("/updatePassword",Reset_password_middleware,update_Password_controller) ;

export default router ;