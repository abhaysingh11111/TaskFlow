import express from "express";
import changeEmail_Routes from './changeEmailroutes.js';
import delAccount_Routes from './delAccount_routes.js';
import profileRoutes from './profileRoutes.js';
import logOutRoute from './logOut_route.js';
import changePassword_Routes from'./changePasswordroute.js' ;

const router = express.Router() ;

router.use("/changeEmail",changeEmail_Routes) ;
router.use("/deleteAccount",delAccount_Routes);
router.use("/changePassword",changePassword_Routes) ;
router.use("/profileRoutes",profileRoutes) ;
router.use("/logOut",logOutRoute) ;
export default router ;