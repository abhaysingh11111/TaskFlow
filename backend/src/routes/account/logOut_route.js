import express from "express" ;
import { Isgenuine } from "../../middleware/authentication/changeEmail.js";
import { logOutcontroller } from "../../controllers/logOutcontroller.js";

const router = express.Router() ;

router.post("/logOut",Isgenuine,logOutcontroller) ;
export default router ;