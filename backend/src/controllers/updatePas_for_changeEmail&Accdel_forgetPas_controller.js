import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import redis from "../config/redis.js";
import Users from "../models/user_schema.js";

export const UpdatePas_for_changeEmail_Accdel_forgetPasFlow_controller = async (req, res) => {

   try {
      console.log(
         "updateForgotPasswordController called with body :",
         req.body
      );

      const {
         passWord,
         confirm_Password,
         token
      } = req.body;

      // =========================
      // required fields validation
      // =========================

      if (!passWord || !confirm_Password || !token) {
         return res.status(400).json({
            status: false,
            message: "All fields are required"
         });
      }

      // =========================
      // password match validation
      // =========================

      if (passWord !== confirm_Password) {
         return res.status(400).json({
            status: false,
            message: "Passwords do not match"
         });
      }

      // =========================
      // password regex validation
      // =========================

      const passWordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,64}$/;

      if (!passWordRegex.test(passWord)) {
         return res.status(400).json({
            status: false,
            message:
            "Password must contain uppercase, lowercase, number and special character"
         });
      }

      // =========================
      // jwt verification
      // =========================
      let decoded;

      try {
         console.log("inside jwt verify");
         decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
         );
      }

      catch (err) {
         console.log(
            "jwt verification error :",
            err.message
         );
         return res.status(401).json({
            status: false,
            message: "Invalid or expired token"
         });
      }

      // =========================
      // token payload validation
      // =========================

      if (!decoded.jwt_Id ||decoded.purpose !== "resetPassword") {
         return res.status(401).json({
            status: false,
            message: "Unauthorized token"
         });
      }

      // =========================
      // redis verification
      // =========================

      const session = await redis.get(
         `key:${decoded.jwt_Id}`
      );

      console.log("session from redis :", session);

      if (!session) {
         return res.status(401).json({
            status: false,
            message: "Reset session expired"
         });
      }

      const parsedData = JSON.parse(session);
      const email = parsedData.email;

      if (!email) {
         return res.status(401).json({
            status: false,
            message: "Invalid session"
         });
      }

      const user = await Users.findOne({
         email
      })

      if (!user) {
         return res.status(404).json({
            status: false,
            message: "User not found"
         });
      }

      // =========================
      // prevent same password reuse
      // =========================

      const isSamePassword = await bcrypt.compare(
         passWord,
         user.passWord
      );

      if (isSamePassword) {

         return res.status(400).json({
            status: false,
            message:
            "New password must be different from old password"
         });
      }

      // =========================
      // hash new password
      // =========================

      const hashedPassword = await bcrypt.hash(
         passWord,
         12
      );

      // =========================
      // update password
      // =========================

      user.passWord = hashedPassword;

      await user.save();

      // =========================
      // delete reset session
      // =========================

      await redis.del(
         `key:${decoded.jwt_Id}`
      );

      // =========================
      // clear auth cookie
      // =========================

      res.clearCookie("token", {
         httpOnly: true,
         secure: true,
         sameSite: "strict"
      });

      // =========================
      // success response
      // =========================

      return res.status(200).json({
         status: true,
         message: "Password updated successfully"
      });

   }
   catch (err) {

      console.log(
         "updateForgotPasswordController error :",
         err.message
      );

      return res.status(500).json({
         status: false,
         message: "Internal server error"
      });
   }
};