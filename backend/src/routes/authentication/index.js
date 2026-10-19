import express from "express";
import login_routes from './login_route.js' // importing login routes
import signup_routes from './Sign_up_route.js'
import forget_pas_routes from './forget_password_route.js'
import { Otp_sender } from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";

const router = express.Router() ;

router.use("/login",login_routes) ;
router.use("/signup",signup_routes);
router.use("/forgetPassword",forget_pas_routes);

// resend otp req route
router.post('/resendOtp',(req,res,next)=>{
    req.purpose = "resendOtp";
    req.flow =  req.body.purpose ;
   console.log("resend req recieved on route") ;
   next() ;
} , Otp_sender) ;

export default router ;