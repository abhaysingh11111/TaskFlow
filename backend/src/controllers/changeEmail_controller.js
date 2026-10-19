import Users from "../models/user_schema.js";

const changeEmail_ccontroller = async (req,res) => {

   try{

      const email =
      req.body.email?.trim().toLowerCase();

      const userId = req.userId;

      console.log(
        "change email controller called with email :",
        email
      );

      // email missing
      if(!email){

         return res.status(400).json({
            status:false,
            message:"Email is required"
         });
      }

      // userId missing
      if(!userId){

         return res.status(401).json({
            status:false,
            message:"Unauthorized access"
         });
      }

      // update email
      const updated =
      await Users.findByIdAndUpdate(

         userId,

         { email },

         { new : true }
      );

      // user not found
      if(!updated){

         return res.status(404).json({

            status : false,

            message : "User not found",

            purpose : "changeEmail"
         });
      }

      // success
      return res.status(200).json({
          status : true,
          purpose : "changeEmail",
          message : "Email updated successfully"
      });

    }
    catch(err){

        console.log(
          "change email controller error :",
          err.message
        );

        return res.status(500).json({

            status : false,

            message : "Internal server error"
        });
    }
};

export { changeEmail_ccontroller };