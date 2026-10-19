import Users from "../../models/user_schema.js";
import redis from "../../config/redis.js";
import jwt from "jsonwebtoken";

// =========================================
// CHANGE EMAIL VERIFY
// =========================================

export const emailVerify = async (req, res, next) => {

   try {

      const token = req.body.token;

      // token missing
      if (!token) {
         return res.status(400).json({
            status: false,
            message: "Token missing",
            purpose: "changeEmail"
         });
      }

      // verify redis token
      const data = await redis.get(`emailChange:${token}`);

      if (!data) {
         return res.status(401).json({
            status: false,
            message: "Invalid or expired token",
            purpose: "changeEmail"
         });
      }

      // browser cookie token
      const cookie = req.cookies.token;

      if (!cookie) {
         return res.status(401).json({
            status: false,
            message: "Unauthorized: No token provided",
            purpose: "changeEmail"
         });
      }

      // verify jwt
      try {

         jwt.verify(
            cookie,
            process.env.JWT_SECRET
         );

      }
      catch (err) {

         console.log("JWT ERROR :", err.message);

         return res.status(401).json({
            status: false,
            message: "Invalid or expired token",
            purpose: "changeEmail"
         });
      }

      // extract email
      const email = req.body.email?.trim().toLowerCase();

      if (!email) {
         return res.status(400).json({
            status: false,
            message: "Email missing",
            purpose: "changeEmail"
         });
      }

      // check email already exists or not
      const isPresent = await Users.findOne({ email });

      if (isPresent) {

         return res.status(409).json({
            status: false,
            message: "Email already registered with another account",
            purpose: "changeEmail"
         });
      }

      // pass email forward
      req.email = email;

      console.log("called to otp sender function");

      return next();

   }
   catch (err) {

      console.log(err.message);

      return res.status(500).json({
         status: false,
         message: "Internal server error"
      });
   }
};




// =========================================
// IS GENUINE
// =========================================

export const Isgenuine = async (req, res, next) => {

   try {

      console.log("inside Isgenuine");

      // extract cookie
      const cookie = req.cookies.token;

      // token missing
      if (!cookie) {

         return res.status(401).json({
            status: false,
            message: "Unauthorized: No token provided"
         });
      }

      console.log("verifying jwt token");

      // verify jwt
      const decoded = jwt.verify(
         cookie,
         process.env.JWT_SECRET
      );

      // extract user id
      const userId = decoded.id;

      if(req.purpose === "forgetPasswordforChangepassword"){
         req.jwtId = decoded.jwt_Id;
      }
      if (!userId) {
         return res.status(401).json({
            status: false,
            message: "Invalid token payload"
         });
      }

      // find user
      const user = await Users.findById(userId);

      if (!user) {
         return res.status(404).json({
            status: false,
            message: "User not found"
         });
      }

      // attach data
      req.userId = userId;
      req.email = user.email;

      // =====================================
      // PROFILE IMAGE VALIDATION
      // =====================================

      if (req.purpose === "profileChange") {

         const img = req.file;

         if (!img) {

            return res.status(400).json({
               status: false,
               message: "No image uploaded"
            });
         }

         // allowed types
         const allowedTypes = [
            "image/png",
            "image/jpeg"
         ];

         if (!allowedTypes.includes(img.mimetype)) {

            return res.status(400).json({
               status: false,
               message: "Only PNG and JPEG allowed"
            });
         }

         // max size 2MB
         const maxSize = 1024 * 1024 * 2;

         if (img.size > maxSize) {

            return res.status(400).json({
               status: false,
               message: "Image size too large"
            });
         }
      }

      console.log("Isgenuine middleware passed");
      return next();
   }
   catch (err) {

      console.log("JWT ERROR :", err.message);

      return res.status(401).json({
         status: false,
         message: "Unauthorized : Invalid token"
      });
   }
};
