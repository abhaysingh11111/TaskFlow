import express from 'express'
import { Isgenuine } from '../../middleware/authentication/changeEmail.js';
import { password_Compare } from '../../middleware/account/password_Matching_middleware.js';
import {update_Password_controller} from '../../controllers/reset_password_controller.js' ;
import { Otp_compare, Otp_sender } from '../../middleware/authentication/email_verifier_otp_sender-verifier.js';
import {changeEmail_Accdel_forPass_flow_DataSave} from '../../controllers/changeEmailandAccountDel_forgetPassword_dataSave.js'

// changePassword req password matching
const router = express.Router() ;

router.post('/passwordCompare',(req,res,next)=>{
    req.purpose = "ChangePassword";
    next() ;
},Isgenuine,password_Compare) ;

// now for match the password
router.post("/passwordUpdate",(req,res,next)=>{
   req.purpose = "changePassword" ;
   next() ;
},Isgenuine,update_Password_controller) ;

// forget password req came now send otp to registered email
router.post("/forgetPasswordforChangepassword",(req,res,next)=>{
   req.purpose = "forgetPasswordforChangepassword";
   next() ;
},Isgenuine,Otp_sender) ;

// forget password for change Password (email otp compare)otp comapre
router.post("/forgetPasswordforChangepassword/otpCompare",(req,res,next)=>{
   req.purpose = "forgetPasswordforChangepassword";
},Isgenuine,Otp_compare,changeEmail_Accdel_forPass_flow_DataSave) ;

// now reset the password for change password forget password flow
router.post("/forgetPasswordforChangepassword_Reset",(req,res,next)=>{
   req.purpose = "forgetPasswordforChangepassword";
},Isgenuine,update_Password_controller) ;
export  default router