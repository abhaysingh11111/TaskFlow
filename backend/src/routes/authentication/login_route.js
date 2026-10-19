// here we will be recieve user login req
import express from 'express'
import Login_middleware from '../../middleware/authentication/login_middleware.js';
import Login_controller from '../../controllers/login_controller.js';
import jwt  from 'jsonwebtoken';

const router = express.Router() ; // now wouter called defineed all routes in the xpress

router.post("/login",Login_middleware,Login_controller,(req,res)=>{
   console.log("login req recieved") ;
});


router.get("/is_Logined", (req , res)=>{
   const is_token = req.cookies.token ;

   if(!is_token){
    return res.status(401).json({
     status:false,
     message:"No token found"
    })
   }

   else if(is_token){

    try{
         const is_verified = jwt.verify(is_token ,process.env.JWT_SECRET) ;
         return res.status(200).json({
            status:true ,message:"logined true"
         }) ;
    }
    catch(err){
         console.log(err.message) ;
         return res.status(401).json({
           status:false ,message:"sended fake token not valid"
         })
    }
   }
   else{ // means not logined
      return res.status(401).json({
         status:false ,message:"token missing not logined"
      })
   }
})

export default router ;