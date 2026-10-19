// here we define thr sender transporter function
import nodemailer from "nodemailer"
      console.log(process.env.USER_EMAIL);console.log(process.env.APP_PASSWORD) ;

const transporter = nodemailer.createTransport({
     service : "gmail",
     auth:{
         user: process.env.USER_EMAIL ,
         pass: process.env.APP_PASSWORD
     }
}) ;
export default transporter ;