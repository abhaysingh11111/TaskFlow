import mongoose from "mongoose";

const Task_schema = new mongoose.Schema({

    task:{
      type : String,
      required :true,
    },
    status:{
      type:String,
      required:true ,
      default: "pending"// iske default value pending hogi
    },
    userId:{
       type: mongoose.Schema.Types.ObjectId,// linked ref of USER database
       ref:"Users", // only for reading and understandibility
       required:true
    }
},{timestamps:true}) ;

const Task = mongoose.model("Task", Task_schema);
export default Task;