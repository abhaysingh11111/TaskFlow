import jwt from "jsonwebtoken";

const Login_controller = async(req , res)=>{

    try{

      // now check that is verified true or not
       if(!req.isVerified){

          // means direct attack happened
          return res.status(401).json({
             status : false,
             message :"Unauthorized"
          });
       }

        const jwt_Token = jwt.sign(
            {
              id : req.user._id,
              userName: req.user.userName,
            },

            process.env.JWT_SECRET,

            {
              expiresIn : "7d",
            }
        );

        res.cookie("token", jwt_Token, {

            httpOnly:true,

            secure:
            process.env.NODE_ENV ===
            "production",

            sameSite:"Lax",

            maxAge:
            7 * 24 * 60 * 60 * 1000
        });

      return res.status(200).json({

          status : true,

          message : "Login successfully"
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

export default Login_controller;