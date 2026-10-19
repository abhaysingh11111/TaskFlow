import task_Dbs from '../models/Tasks_schema.js';
import mongoose from "mongoose";
import { cancelMap } from "../store/cancelMap.js";

// ============================================
// TASK CREATE + LAST 24 HOURS HISTORY
// ============================================

export const Task_adding_and_24hrs_pending_task_controller = async(req , res) =>{

  try{

    // =========================================
    // TASK CREATE
    // =========================================

    if(req.purpose === "task_Create"){

        const task = req.body.task?.trim();

        // validation
        if(!task){
          return res.status(400).json({
            status:false,
            message:"Task is required"
          });
        }

        // create task
        const task_Create = await task_Dbs.create({
           task,
           userId: req.user_Id,
           status: "pending"
        });

        return res.status(201).json({
          task_Obj: task_Create,
          status: true
        });
    }


    // =========================================
    // LAST 24 HOURS PENDING TASKS
    // =========================================

    if(req.purpose === "last_24hrs_History"){

        const last24Hours =
        new Date(Date.now() - 24 * 60 * 60 * 1000);

        const page = Number(req.body.page);

        const limit = Number(req.body.limit);

        // validation
        if(page <= 0 || isNaN(page)){

          return res.status(400).json({
            success: false,
            message: "Invalid page"
          });
        }

        if(limit <= 0 || isNaN(limit)){

          return res.status(400).json({
             success: false,
             message: "Invalid limit"
          });
        }

        const skip = (page - 1) * limit;

        // fetch tasks
        const last_24_Hours_tasks =
        await task_Dbs.find({
          userId: req.user_Id,
          status: "pending",
          createdAt: { $gte: last24Hours }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        // total count
        const total_Count =
        await task_Dbs.countDocuments({
           userId: req.user_Id,
           status: "pending",
           createdAt: {
             $gte: last24Hours
           }
        });

        // no task found
        if(total_Count === 0){

          return res.status(200).json({
              status: true,
              message:"No task found",
              chunk:[]
          });
        }

        // total pages
        const total_Pages =
        Math.ceil(total_Count / limit);

        // response
        return res.status(200).json({
          chunk:last_24_Hours_tasks,
          total_Pages,
          status:true,
          message:"Chunk sent successfully"
        });
    }

  }
  catch(err){

    console.log(err.message);

    return res.status(500).json({
       status:false,
       message :"Internal server error"
    });
  }
};




// ============================================
// TASK EDIT
// ============================================

export const Task_edit_controller = async(req , res) =>{

  try{

     console.log("inside task edit controller");

     const id = req.user_Id;

     const updated_Task =
     req.body.task?.trim();

     const task_Id = req.body.task_Id;

     // validation
     if(!updated_Task){

       return res.status(400).json({
         status:false,
         message:"Task is required"
       });
     }

     // validate object id
     if(!mongoose.Types.ObjectId.isValid(task_Id)){

       return res.status(400).json({
         status:false,
         message:"Invalid task id"
       });
     }

     // cancel check
     if(cancelMap.has(task_Id)){

        cancelMap.delete(task_Id);

        return res.status(400).json({
            message: "Cancelled before saving",
            status:false
        });
     }

     // update task
     const update_Task =
     await task_Dbs.findOneAndUpdate(

        {
          _id: task_Id,
          userId: id,
          status: "pending"
        },

        {
          $set:{
             task: updated_Task
          }
        },

        { new: true }
     );

     console.log("task updated");

     // task not found
     if(!update_Task){

        return res.status(404).json({
          status:false,
          message: "Task not found"
        });
     }

     return res.status(200).json({
        status:true,
        message :"Task edited successfully"
     });

  }
  catch(err){

    console.log(err.message);

    return res.status(500).json({
       status:false,
       message :"Internal server error"
    });
  }
};




// ============================================
// TASK DELETE
// ============================================

export const Task_deleting_controller = async(req , res) =>{

 try{

    const id = req.user_Id;

    const del_task_id = req.body.task_Id;

    // validate object id
    if(!mongoose.Types.ObjectId.isValid(del_task_id)){

      return res.status(400).json({
        status:false,
        message:"Invalid task id"
      });
    }

    // soft delete
    const del_task =
    await task_Dbs.findOneAndUpdate(

      {
        _id : del_task_id,
        userId: id,
        status:"pending"
      },

      {
        $set:{
          status :"deleted"
        }
      },

      { new:true }
    );

   // task not found
   if(!del_task){

      return res.status(404).json({
         status:false,
         message: "Task not found"
      });
   }

   return res.status(200).json({
      status:true,
      message:"Task deleted successfully"
   });

 }
 catch(err){

    console.log(err.message);

    return res.status(500).json({
       status:false,
       message:"Internal server error"
    });
 }
};




// ============================================
// TASK HISTORY
// ============================================

export const Task_history_controller = async (req, res) => {

  try {

    const id = req.user_Id;

    const page = parseInt(req.body.page);

    const limit = parseInt(req.body.limit);

    // validation
    if (page <= 0 || isNaN(page)) {

      return res.status(400).json({
        success: false,
        message: "Invalid page"
      });
    }

    if (limit <= 0 || isNaN(limit)) {

      return res.status(400).json({
        success: false,
        message: "Invalid limit"
      });
    }

    const skip = (page - 1) * limit;

    // total docs
    const totalDocs =
    await task_Dbs.countDocuments({
      userId: id
    });

    // fetch tasks
    const all_Tasks =
    await task_Dbs.find({
      userId: id
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // total pages
    const total_Pages =
    Math.ceil(totalDocs / limit);

    // no data
    if (totalDocs === 0) {

      return res.status(200).json({
        status: true,
        message: "No data found",
        tasks: []
      });
    }

    // response
    return res.status(200).json({
      status: true,
      tasks: all_Tasks,
      message: "Sent successfully",
      total_Pages,
      current_page: page,
      history_Chunk: all_Tasks
    });
  }
  catch (err) {

    console.log(err.message);

    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};




// ============================================
// TASK COMPLETE
// ============================================

export const Task_Complete_controller = async(req,res) =>{

   const userId = req.user_Id;

   const taskId = req.body.task_Id;

   console.log("inside task complete controller");

   // validation
   if (!taskId) {

      return res.status(400).json({
        message: "Task ID Missing",
        status:false
      });
   }

   // validate object id
   if(!mongoose.Types.ObjectId.isValid(taskId)) {

      return res.status(400).json({
        status: false,
        message: "Invalid Task ID"
      });
   }

   try{

      console.log("inside try block");

      // update task
      const is_Task_Found =
      await task_Dbs.findOneAndUpdate(

        {
          _id: taskId,
          userId: userId,
          status: "pending"
        },

        {
          $set: {
            status: "completed"
          }
        },

        { new: true }
      );

      console.log("task update cross");

      // task not found
      if(is_Task_Found === null){

         return res.status(404).json({
             status : false,
             message :"Task not found"
         });
      }

      return res.status(200).json({
         status:true,
         message :"Task status updated successfully"
      });

   }
   catch(err){

      console.log(err.message);

      return res.status(500).json({
         status :false,
         message :"Something went wrong"
      });
   }
}