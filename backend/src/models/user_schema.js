import mongoose from "mongoose";

  const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true
    },
    passWord:{
      type:String,
      minlength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      required:true  // while login
    },
    fullName:{
      type:String,
      required:true,
    },
    userName:{
      type:String,
      required:true, // while login
      unique:true
    },
    profileImg:{
      type:String,
      default:"https://tse4.mm.bing.net/th/id/OIP.hGSCbXlcOjL_9mmzerqAbQHaHa?pid=Api&P=0&h=180"
    }
  })  ;

  export default  mongoose.model("Users", userSchema);