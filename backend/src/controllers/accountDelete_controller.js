import Users from "../models/user_schema.js";
import redis from "../config/redis.js";

export const Account_delete_Controller = async (req,res)=>{

    console.log("ACCOUNT DEL CONTROLLER INSIDE");

    // this controller is for delete the account permanently
    const userId = req.userId;

    // unauthorized
    if (!userId) {

      return res.status(401).json({
          status: false,
          message: "Unauthorized"
      });
    }

    try{
       const deletedUser = await Users.findByIdAndDelete(userId);

       // user not found
       if (!deletedUser) {
           return res.status(404).json({
             status: false,
             message: "User not found"
           });
       }

       // blacklist token
       const token =req.cookies?.token;

       if(token){
          await redis.set(
             `blacklistedToken:${token}`,
             "true",
             {
               EX:
               60 * 60 * 24 * 7
             }
          );
       }

       // clear cookie
       res.clearCookie("token", {
           httpOnly : true,
           secure:
           process.env.NODE_ENV ===
           "production",
           sameSite : "none"
       });

       console.log(
         "user deleted successfully"
       );

       return res.status(200).json({
            status : true,
            message : "Account deleted successfully",
            purpose:"deleteAccount"
       });
    }
    catch(err){

        console.log(err.message);

        return res.status(500).json({

            status : false,

            message :
            "Internal server error"
        });
    }
}
