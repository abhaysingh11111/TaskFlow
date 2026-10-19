import express from "express" ;
import { password_Compare } from "../../middleware/account/password_Matching_middleware.js";
import { emailVerify } from "../../middleware/authentication/changeEmail.js";
import { Otp_compare, Otp_sender } from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";
import { changeEmail_ccontroller } from "../../controllers/changeEmail_controller.js";
import { emailVerifier } from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";
import { Isgenuine } from "../../middleware/authentication/changeEmail.js";
import { UpdatePas_for_changeEmail_Accdel_forgetPasFlow_controller } from "../../controllers/updatePas_for_changeEmail&Accdel_forgetPas_controller.js";
import { changeEmail_Accdel_forPass_flow_DataSave } from "../../controllers/changeEmailandAccountDel_forgetPassword_dataSave.js";

const router = express.Router() ; // now wouter called defineed all routes in the xpress

// route for matching the old password
router.post('/password_Matching',password_Compare) ;

// route for sending otp to new updated email after verification(token + userId)
router.post("/changeEmail",(req,res,next)=>{
   req.purpose = "changeEmail" ;
   next() ;
},emailVerify,Otp_sender) ; {/* changeEmail purpose otpCount and than block for that purse after reach*/}

// route for matching otp
router.post("/changeEmail/otpCompare",(req , res , next)=>{
    req.purpose = "changeEmail" ;
   next() ;
},Isgenuine,Otp_compare,changeEmail_ccontroller)  ; {/* also this flow based otp comapre counter */}

// when user is logined and he wanna chanage there email but he forgets there acc password
router.post("/changeEmailForgetpassword",(req,res,next)=>{
    req.purpose = "changeEmailForgetPassword" ;
        next() ;
},Isgenuine,Otp_sender); {/*for change Email forget password OTP CPUNT BLOCK FLOw*/}

// route for matching otp for change email when user forgets there password
router.post("/changeEmailForgetpassword/otpCompare",(req,res,next)=>{
    req.purpose = "changeEmailForgetPassword" ;
    next() ;
},Isgenuine,Otp_compare,changeEmail_Accdel_forPass_flow_DataSave)  ; {/* for change email flow forget password otp compare count*/}

//reset password  route for change email  when user forgets there password
router.post("/changeEmailForgetpasswordResetPassword",(req,res,next)=>{
    req.purpose = "changeEmail_resetPassword_forgetPassword_flow" ;
    next() ;
},Isgenuine,UpdatePas_for_changeEmail_Accdel_forgetPasFlow_controller)  ;

export default router ;