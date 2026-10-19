import express from "express"
import {Isgenuine} from "../../middleware/authentication/changeEmail.js" ;
import {getProfileData_controller,ProfileImgChangeController,ProfileNameChangeController} from "../../controllers/profileData_controller.js" ;
import { FcNext } from "react-icons/fc";
import upload  from "../../middleware/account/multer.js";

const router = express.Router() ;

// yr profile ka data(img fullname and email frontend ko dega after verfifcation user is genuine or not )
router.get("/getProfileData",Isgenuine , getProfileData_controller) ;

// profile img change route
router.post("/profileImg_Change",(req,res,next)=>{
    req.purpose = "profileChange" ;
    next()
},upload.single("profileImg"),Isgenuine ,ProfileImgChangeController) ;

// profile name change route
router.post("/profileName_Change",Isgenuine ,ProfileNameChangeController) ;
export default router ;