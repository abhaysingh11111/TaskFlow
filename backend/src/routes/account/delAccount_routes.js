import express from "express"
import { Isgenuine } from "../../middleware/authentication/changeEmail.js";
import { Otp_compare } from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";
import { Otp_sender } from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";
import {Account_delete_Controller} from "../../controllers/accountDelete_controller.js"
import {password_Compare} from  '../../middleware/account/password_Matching_middleware.js';
import {UpdatePas_for_changeEmail_Accdel_forgetPasFlow_controller} from '../../controllers/updatePas_for_changeEmail&Accdel_forgetPas_controller.js'
import { changeEmail_Accdel_forPass_flow_DataSave } from "../../controllers/changeEmailandAccountDel_forgetPassword_dataSave.js";

const router = express.Router() ;

// for permanently delete the account
router.post("/deleteAccount",(req,res,next)=>{
   req.purpose = "deleteAccount" ;
    next() ;
},password_Compare,Isgenuine,Otp_sender) ; {/* for del account purpose otpCount and than block for that purse after reach*/}

// route for matching otp for delete account
router.post("/deleteAccount/otpCompare",(req,res,next)=>{
    req.purpose = "deleteAccount" ;
    next() ;
},Isgenuine,Otp_compare,Account_delete_Controller); {/* del account purpose otpCount and than block for that purse after reach*/}

// when user is logined and he wanna chanage there email but he forgets there acc password
router.post("/deleteAccountForgetpassword",(req,res,next)=>{
    req.purpose = "deleteAccountForgetPassword" ;
    console.log("inside del acc for password route ") ;
    next() ;
},Isgenuine,Otp_sender) ;  {/*for del acc forget password OTP CPUNT BLOCK when max more than 5*/}

// route for matching otp for change email when user forgets there password
router.post("/deleteAccountForgetpassword/otpCompare",(req,res,next)=>{
    req.purpose = "deleteAccountForgetPassword";
    next() ;
},Isgenuine,Otp_compare,changeEmail_Accdel_forPass_flow_DataSave)  ;{/*Del account otp forget password otp compare flow when more than 25 block*/}

// password matching route for delete account when user forgets there password
router.post("/deleteAccountForgetpasswordResetPassword",(req,res,next)=>{
    req.purpose = "deleteAccount_resetPassword_forgetPassword_flow" ;
    next() ;
},Isgenuine,UpdatePas_for_changeEmail_Accdel_forgetPasFlow_controller)  ;

export default router ;