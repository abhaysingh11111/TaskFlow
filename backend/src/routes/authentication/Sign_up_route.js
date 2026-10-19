import express from "express"
import Sign_up_middleware from '../../middleware/authentication/signup_middleware.js'
import {emailVerifier} from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";
import {Otp_sender} from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";
import { Otp_compare } from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";
import { signup_Controller } from "../../controllers/sign_up_controller.js";

const router = express.Router() ;

router.post("/signup",(req,res,next)=>{
    req.purpose = "signup"
    next() ;
},Sign_up_middleware,emailVerifier,Otp_sender);

// yha pe otp compare dena hai
router.post("/signup/otpCompare",(req,res,next)=>{
    req.purpose = "signup" ;
    next() ;
},Otp_compare,signup_Controller) ;

export default router ;