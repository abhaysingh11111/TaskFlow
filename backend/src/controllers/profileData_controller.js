import Users from "../models/user_schema.js";
import cloudinary from '../config/cloudinary.js';

// ==========================================
// GET PROFILE DATA
// ==========================================

export const getProfileData_controller =async(req,res) => {

    try{

       const email = req.email;

       // email missing
       if(!email){

          return res.status(400).json({
            status : false,
            message :"Email is missing"
          });
       }

       // find user
       const isUser =
       await Users.findOne({email})
       .select("fullName email profileImg");

       // user not found
       if(!isUser){

          return res.status(404).json({
             status:false,
             message:"User not found"
          });
       }

       return res.status(200).json({

            status:true,

            message:
            "Profile data extracted successfully",

            data:{
               fullName:isUser.fullName,
               email:isUser.email,
               profileImg:isUser.profileImg
            }
       });
    }
    catch (error) {

      console.log(error.message);

      return res.status(500).json({
         message: "Internal server error",
         status :false
      });
    }
};


// ==========================================
// PROFILE IMAGE CHANGE
// ==========================================
export const ProfileImgChangeController = async (req, res) => {

  try {

    console.log("====================================");
    console.log("ProfileImgChangeController STARTED");
    console.log("====================================");

    const email = req.email;
    console.log("Email extracted from req.email :", email);

    const file = req.file;
    console.log("File received :", !!file);

    if (file) {
      console.log("File Details =>");
      console.log("Original Name :", file.originalname);
      console.log("Mime Type :", file.mimetype);
      console.log("File Size :", file.size);
    }

    console.log("Inside profile image controller");

    // file validation
    console.log("Checking file validation...");

    if (!file) {

      console.log("ERROR: File is missing");

      return res.status(400).json({
        status: false,
        message: "Image is missing"
      });
    }

    console.log("File validation passed");

    // email validation
    console.log("Checking email validation...");

    if (!email) {

      console.log("ERROR: Email missing from req.email");

      return res.status(401).json({
        status: false,
        message: "Unauthorized access"
      });
    }

    console.log("Email validation passed");

    // convert to base64
    console.log("Converting image to base64...");

    const base64 =
      `data:${file.mimetype};base64,${
        file.buffer.toString("base64")
      }`;

    console.log("Base64 conversion successful");
    console.log("Base64 length :", base64.length);

    // upload image
    console.log("Uploading image to Cloudinary...");

    const uploadResult =
      await cloudinary.uploader.upload(base64);

    console.log("Cloudinary response received");
    console.log("Upload Result :", uploadResult);

    // upload failed
    if (!uploadResult?.secure_url) {

      console.log("ERROR: Cloudinary upload failed");

      return res.status(500).json({
        status: false,
        message: "Image upload failed"
      });
    }

    console.log("Cloudinary upload successful");
    console.log("Image URL :", uploadResult.secure_url);

    const imgUrl =
      uploadResult.secure_url;

    // find user
    console.log("Finding user in database...");

    const isUser =
      await Users.findOne({ email });

    console.log("Database query completed");

    // user not found
    if (!isUser) {

      console.log("ERROR: User not found");

      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    console.log("User found");
    console.log("User ID :", isUser._id);
    console.log("Old Profile Image :", isUser.profileImg);

    // TODO:
    // delete previous cloudinary image

    // update image
    console.log("Updating profile image...");

    isUser.profileImg = imgUrl;

    console.log("Saving updated user...");

    await isUser.save();

    console.log("User saved successfully");
    console.log("New Profile Image :", imgUrl);

    console.log("Profile image updated successfully");

    return res.status(200).json({

      status: true,

      message:
        "Profile image updated successfully"
    });

  }
  catch (err) {

    console.log("====================================");
    console.log("ERROR INSIDE ProfileImgChangeController");
    console.log("====================================");

    console.log("Error Message :", err.message);
    console.log("Error Stack :", err.stack);

    return res.status(500).json({

      status: false,

      message:
        "Internal server error"
    });
  }
};
// ==========================================
// PROFILE NAME CHANGE
// ==========================================

export const ProfileNameChangeController =
async (req, res) => {

   try {

      console.log(
        "inside profile name controller"
      );

      const fullName =
      req.body.fullName?.trim();

      const email = req.email;

      const nameRegex =
      /^[\p{L}][\p{L} .'-]{1,48}[\p{L}]$/u;

      // unauthorized
      if (!email) {

         return res.status(401).json({
            status: false,
            message: "Unauthorized access"
         });
      }

      // required validation
      if (!fullName) {

         return res.status(400).json({
            status: false,
            message: "Full name is required"
         });
      }

      // min length
      if(fullName.length < 2){

         return res.status(400).json({
            status: false,
            message: "Name too short"
         });
      }

      // max length
      if (fullName.length > 50) {

         return res.status(400).json({
            status: false,
            message: "Name too long"
         });
      }

      // regex validation
      if(!nameRegex.test(fullName)){

        return res.status(400).json({
          status:false,
          message:"Invalid name format"
        });
      }

      // find user
      const user =
      await Users.findOne({ email });

      // user not found
      if(!user){

         return res.status(404).json({
            status:false,
            message:"User not found"
         });
      }

      // update name
      user.fullName = fullName;

      await user.save();

      return res.status(200).json({

         status: true,

         message:
         "Profile name updated successfully"
      });

   }
   catch (err) {

      console.log(err);

      return res.status(500).json({

         status: false,

         message:
         "Internal server error"
      });
   }
};