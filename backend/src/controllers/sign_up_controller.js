import Users from "../models/user_schema.js";
import jwt from "jsonwebtoken";

// now save the user
export const signup_Controller = async(req, res) =>{

  try{

    const userName =
    req.data.userName?.trim();

    const fullName =
    req.data.fullName?.trim();

    const hashedPassword =
    req.data.passWord;

    const email =
    req.data.email?.trim().toLowerCase();

    // create user
    const newUser = await Users.create({

         email,
         userName,
         fullName,
         passWord: hashedPassword
    });

    console.log("new user created");

    // generate jwt
    const jwt_Token = jwt.sign(

      {
         id: newUser._id,
         userName: newUser.userName
      },

      process.env.JWT_SECRET,

      {
         expiresIn: "7d"
      }
    );

    console.log("token generated");

    // cookie
    res.cookie("token", jwt_Token, {

       httpOnly: true,

       secure:
       process.env.NODE_ENV ===
       "production",

       sameSite: "none",

       maxAge:
       7 * 24 * 60 * 60 * 1000
    });

    // response
    return res.status(201).json({
        status: true,
        message:
        "User signup successfully",
        purpose: "signup"
    });

  }
  catch(err){
     console.log(err.message);

     // duplicate key error
     if(err.code === 11000){

        return res.status(409).json({

           status:false,

           message:
           "Email or username already exists"
        });
     }

     return res.status(500).json({
        status: false,

        message:
        "Internal server error"
     });
  }
};
