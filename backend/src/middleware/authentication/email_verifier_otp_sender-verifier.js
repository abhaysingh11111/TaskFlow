import Users from "../../models/user_schema.js";
import crypto from "crypto";
import redis from "../../config/redis.js";
import bcrypt from "bcrypt";
import transporter from "../../utils/mail_info.js";
import jwt from "jsonwebtoken";

// Generate OTP
export const generateOtp = () => {
   return crypto.randomInt(100000, 1000000).toString();
};

// Hash OTP
const hashOtp = async (otp) => {
   return await bcrypt.hash(otp, 10);
};

// =========================================
// EMAIL VERIFIER
// =========================================

export const emailVerifier = async (req, res, next) => {
   try {
      const email = req.body.email?.trim().toLowerCase();

      if (!email) {
         return res.status(400).json({
            status: false,
            message: "Email required"
         });
      }

      // Signup
      if (req.purpose === "signup") {
         const userName = req.body.userName?.trim();

         const is_Email_exist = await Users.findOne({ email });
         const is_Username_exist = await Users.findOne({ userName });

         if (is_Email_exist) {
            return res.status(409).json({
               status: false,
               error: "Emailalreadyregistered"
            });
         }

         if (is_Username_exist) {
            return res.status(409).json({
               status: false,
               message: "Username already exists",
               error: "Usernamealreadyexists"
            });
         }
      }

      // Forget password
      if (req.purpose === "forgetPassword") {
         const is_Email_exist = await Users.findOne({ email });

         if (!is_Email_exist) {
            return res.status(404).json({
               status: false,
               message: "Email not registered"
            });
         }
      }

      next();
   } catch (err) {
      console.error("Email verifier failed:", err.name);

      return res.status(500).json({
         status: false,
         message: "Internal server error"
      });
   }
};

// =========================================
// OTP SENDER
// =========================================

export const Otp_sender = async (req, res) => {
   try {
      let email;

      // Protected flows
      if (
         req.purpose === "changeEmail" ||
         req.purpose === "changeEmailForgetPassword" ||
         req.purpose === "deleteAccount" ||
         req.purpose === "deleteAccountForgetPassword" ||
         req.purpose === "forgetPasswordforChangepassword"
      ) {
         email = req.email?.trim().toLowerCase();
      } else {
         email = req.body.email?.trim().toLowerCase();
      }

      if (!email) {
         return res.status(400).json({
            status: false,
            message: "Email missing"
         });
      }

      const purpose = req.purpose;

      // Redis keys
      const otpCountKey = `otp_count:${purpose}:${email}`;
      const blockedKey = `blocked:${purpose}:${email}`;
      const cooldownKey = `cooldown:${purpose}:${email}`;

      // Blocked check
      const isBlocked = await redis.exists(blockedKey);

      if (isBlocked) {
         return res.status(429).json({
            status: false,
            message: "Maximum OTP limit reached. Try again after 24 hours.",
            code: "ACCOUNT_BLOCKED_24H"
         });
      }

      // Cooldown check
      const isCooldown = await redis.exists(cooldownKey);

      if (isCooldown) {
         const ttl = await redis.ttl(cooldownKey);

         return res.status(429).json({
            status: false,
            message: `Wait ${ttl} seconds before requesting another OTP`,
            code: "OTP_COOLDOWN",
            retryAfter: ttl
         });
      }

      // OTP request count
      const otpCountExists = await redis.exists(otpCountKey);

      if (!otpCountExists) {
         await redis.hSet(otpCountKey, {
            count: 1
         });

         await redis.expire(otpCountKey, 86400);
      } else {
         await redis.hIncrBy(otpCountKey, "count", 1);

         const data = await redis.hGetAll(otpCountKey);

         if (Number(data.count) >= 5) {
            await redis.setEx(
               blockedKey,
               86400,
               "blocked"
            );

            return res.status(429).json({
               status: false,
               message: "Too many OTP requests. Blocked for 24 hours."
            });
         }
      }

      // Generate and hash OTP
      const plainOtp = generateOtp();
      const hashedOtp = await hashOtp(plainOtp);

      await redis.setEx(
         `otp:${purpose}:${email}`,
         120,
         hashedOtp
      );

      // =====================================
      // STORE FLOW DATA
      // =====================================

      // Signup
      if (req.purpose === "signup") {
         const hashedPassword = await bcrypt.hash(
            req.body.passWord,
            10
         );

         await redis.setEx(
            `data:${purpose}:${email}`,
            900,
            JSON.stringify({
               userName: req.body.userName,
               fullName: req.body.fullName,
               email: req.body.email,
               passWord: hashedPassword
            })
         );
      }

      // Forget password
      if (
         req.purpose === "forgetPassword" ||
         req.purpose === "changeEmailForgetPassword" ||
         req.purpose === "deleteAccountForgetPassword" ||
         req.purpose === "forgetPasswordforChangepassword"
      ) {
         await redis.setEx(
            `data:${purpose}:${email}`,
            900,
            JSON.stringify({
               email
            })
         );
      }

      // Protected flows
      if (
         req.purpose === "changeEmail" ||
         req.purpose === "deleteAccount"
      ) {
         await redis.setEx(
            `data:${purpose}:${email}`,
            900,
            JSON.stringify({
               verified: true
            })
         );
      }

      // Resend OTP
      if (req.purpose === "resendOtp") {
         const dataExists = await redis.exists(
            `data:${req.flow}:${email}`
         );

         if (!dataExists) {
            return res.status(400).json({
               status: false,
               message: "No existing data found for this email and purpose"
            });
         }

         await redis.setEx(
            `otp:${req.flow}:${email}`,
            120,
            hashedOtp
         );
      }

      // Send OTP email through Resend API
      await transporter.sendMail({
         from: process.env.RESEND_FROM_EMAIL,
         to: email,
         subject: "OTP Verification",
         html: `
            <h2>Email Verification</h2>
            <p>Your OTP is:</p>
            <h1>${plainOtp}</h1>
            <p>OTP valid for 2 minutes.</p>
         `
      });

      // Cooldown
      await redis.setEx(
         cooldownKey,
         60,
         "active"
      );

      return res.status(200).json({
         status: true,
         message: "OTP sent successfully",
         email
      });
   } catch (err) {
      console.error(
         "OTP sender failed:",
         err.name,
         err.code || "NO_ERROR_CODE"
      );

      return res.status(500).json({
         status: false,
         message: "Unable to send OTP. Please try again."
      });
   }
};

// =========================================
// OTP COMPARE
// =========================================

export const Otp_compare = async (req, res, next) => {
   try {
      let email;

      if (
         req.purpose === "changeEmailForgetPassword" ||
         req.purpose === "deleteAccountForgetPassword" ||
         req.purpose === "forgetPasswordforChangepassword"
      ) {
         email = req.email?.trim().toLowerCase();
      } else {
         email = req.body.email?.trim().toLowerCase();
      }

      if (!email) {
         return res.status(400).json({
            status: false,
            message: "Email required"
         });
      }

      const purpose = req.purpose;
      const otp = req.body.otp?.trim();

      if (!otp || !/^\d{6}$/.test(otp)) {
         return res.status(400).json({
            status: false,
            message: "Invalid OTP format"
         });
      }

      // Compare attempt keys
      const compareAttemptKey =
         `compare_attempt:${purpose}:${email}`;

      const compareBlockedKey =
         `compare_blocked:${purpose}:${email}`;

      // Blocked check
      if (await redis.exists(compareBlockedKey)) {
         return res.status(429).json({
            status: false,
            message: "Too many invalid OTP attempts"
         });
      }

      // Retrieve stored OTP hash
      const storedOtp = await redis.get(
         `otp:${purpose}:${email}`
      );

      if (!storedOtp) {
         return res.status(410).json({
            status: false,
            message: "OTP expired"
         });
      }

      // Compare OTP
      const isValid = await bcrypt.compare(
         otp,
         storedOtp
      );

      if (!isValid) {
         if (!(await redis.exists(compareAttemptKey))) {
            await redis.hSet(compareAttemptKey, {
               attempt: 1
            });

            await redis.expire(
               compareAttemptKey,
               86400
            );
         } else {
            await redis.hIncrBy(
               compareAttemptKey,
               "attempt",
               1
            );

            const data = await redis.hGetAll(
               compareAttemptKey
            );

            if (Number(data.attempt) >= 25) {
               await redis.setEx(
                  compareBlockedKey,
                  86400,
                  "blocked"
               );

               return res.status(429).json({
                  status: false,
                  message: "Too many invalid OTP attempts"
               });
            }
         }

         return res.status(401).json({
            status: false,
            message: "Invalid OTP"
         });
      }

      // OTP verified successfully
      await redis.del(`otp:${purpose}:${email}`);
      await redis.del(compareAttemptKey);
      await redis.del(compareBlockedKey);

      // Signup
      if (req.purpose === "signup") {
         const data = await redis.get(
            `data:${purpose}:${email}`
         );

         if (!data) {
            return res.status(410).json({
               status: false,
               message: "Signup session expired. Request a new OTP."
            });
         }

         req.data = JSON.parse(data);

         await redis.del(`data:${purpose}:${email}`);

         return next();
      }

      // Forget password
      if (req.purpose === "forgetPassword") {
         const jti = crypto.randomBytes(16).toString("hex");

         const token = jwt.sign(
            {
               purpose: "resetPassword",
               jwt_Id: jti
            },
            process.env.JWT_SECRET,
            {
               expiresIn: "15m"
            }
         );

         await redis.setEx(
            `key:${jti}`,
            900,
            JSON.stringify({
               email,
               purpose
            })
         );

         return res.status(200).json({
            status: true,
            message: "OTP verified successfully",
            token,
            purpose: "forgetPassword"
         });
      }

      // Protected flows
      if (
         req.purpose === "changeEmail" ||
         req.purpose === "changeEmailForgetPassword" ||
         req.purpose === "deleteAccount" ||
         req.purpose === "deleteAccountForgetPassword" ||
         req.purpose === "forgetPasswordforChangepassword"
      ) {
         const token = req.cookies.token;

         if (!token) {
            return res.status(401).json({
               status: false,
               message: "Unauthorized"
            });
         }

         const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
         );

         req.userId = decoded.id;
         req.isVerified = true;

         return next();
      }

      return res.status(400).json({
         status: false,
         message: "Unsupported OTP verification flow"
      });
   } catch (err) {
      console.error(
         "OTP verification failed:",
         err.name,
         err.code || "NO_ERROR_CODE"
      );

      return res.status(500).json({
         status: false,
         message: "Unable to verify OTP. Please try again."
      });
   }
};