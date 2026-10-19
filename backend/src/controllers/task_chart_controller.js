import task_Dbs from '../models/Tasks_schema.js';
import mongoose from 'mongoose';

export const task_Chart_controller = async(req , res) =>{

  const today = new Date();
  const end_Date = new Date(today);
  end_Date.setHours(23,59,59,999);
  const start_Date = new Date(today);

  start_Date.setDate(
    today.getDate() - today.getDay()
  );

  start_Date.setHours(0,0,0,0);

  try{

     // validate user id
     if(
       !mongoose.Types.ObjectId.isValid(
         req.user_Id
       )
     ){

       return res.status(400).json({
          status:false,
          message:"Invalid user id"
       });
     }

     // aggregate data
     const user_Performance =
     await task_Dbs.aggregate([

        {
          $match:{
             userId:
             new mongoose.Types.ObjectId(
               req.user_Id
             )
          }
        },

        {
          $facet:{

            // ====================================
            // WEEKLY STATUS DATA
            // ====================================

            inRangestatus_data:[

              {
                $match:{
                   createdAt:{
                      $gte:start_Date,
                      $lte:end_Date
                   }
                }
              },

              {
                $group:{
                   _id:"$status",
                   count:{ $sum:1 }
                }
              }
            ],

            // ====================================
            // TOTAL STATUS DATA
            // ====================================

            totalStatus_data:[

              {
                $group:{
                   _id :"$status",
                   count:{ $sum:1 }
                }
              }
            ],

            // ====================================
            // DAYWISE DATA
            // ====================================

            dayWise_data:[

              {
                $match:{
                   createdAt:{
                      $gte:start_Date,
                      $lte:end_Date
                   }
                }
              },

              {
                $group:{
                   _id:{
                      status:"$status",
                      day:{
                        $dayOfWeek:"$createdAt"
                      }
                   },

                   count:{ $sum:1 }
                }
              }
            ]
          }
        }
     ]);

     // no data
     if(
       !user_Performance ||
       user_Performance.length === 0
     ){

        return res.status(200).json({
           status : true,
           message :"No data found",
           data : []
        });
     }

     // extract data
     const weakly_Data =
     user_Performance[0]
     .inRangestatus_data || [];

     const total_Data =
     user_Performance[0]
     .totalStatus_data || [];

     const daywise_Data =
     user_Performance[0]
     .dayWise_data || [];

     // maps
     const weakly_Task_Map = {};

     const total_Task_Map = {};

     const daywise_Task_Map = {};



     // ====================================
     // WEEKLY MAP
     // ====================================

     weakly_Data.forEach(item => {

        weakly_Task_Map[item._id] =
        item.count;
     });



     // ====================================
     // TOTAL MAP
     // ====================================

     total_Data.forEach(item => {

        total_Task_Map[item._id] =
        item.count;
     });



     // ====================================
     // DAYWISE MAP
     // ====================================

     daywise_Data.forEach(item => {

       const day = item._id.day;

       const status = item._id.status;

       daywise_Task_Map[
         `day_${day}_${status}`
       ] = item.count;
     });



     // ====================================
     // WEEKLY DATA
     // ====================================

     const pending_Weakly_task =
     weakly_Task_Map["pending"] || 0;

     const deleted_Weakly_task =
     weakly_Task_Map["deleted"] || 0;

     const completed_Weakly_task =
     weakly_Task_Map["completed"] || 0;

     const total_Weakly_task =

     pending_Weakly_task +
     deleted_Weakly_task +
     completed_Weakly_task;



     // ====================================
     // TOTAL DATA
     // ====================================

     const pending_Total_task =
     total_Task_Map["pending"] || 0;

     const deleted_Total_task =
     total_Task_Map["deleted"] || 0;

     const completed_Total_task =
     total_Task_Map["completed"] || 0;

     const total_task =

     pending_Total_task +
     deleted_Total_task +
     completed_Total_task;



     // ====================================
     // DAYWISE OBJECTS
     // ====================================

     const sunday_Task_obj = {
        completed :
        daywise_Task_Map[
          "day_1_completed"
        ] || 0,

        pending :
        daywise_Task_Map[
          "day_1_pending"
        ] || 0,

        deleted :
        daywise_Task_Map[
          "day_1_deleted"
        ] || 0
     };



     const monday_Task_obj = {
        completed :
        daywise_Task_Map[
          "day_2_completed"
        ] || 0,

        pending :
        daywise_Task_Map[
          "day_2_pending"
        ] || 0,

        deleted :
        daywise_Task_Map[
          "day_2_deleted"
        ] || 0
     };



     const tuesday_Task_obj = {
        completed :
        daywise_Task_Map[
          "day_3_completed"
        ] || 0,

        pending :
        daywise_Task_Map[
          "day_3_pending"
        ] || 0,

        deleted :
        daywise_Task_Map[
          "day_3_deleted"
        ] || 0
     };



     const wednesday_Task_obj = {
        completed :
        daywise_Task_Map[
          "day_4_completed"
        ] || 0,

        pending :
        daywise_Task_Map[
          "day_4_pending"
        ] || 0,

        deleted :
        daywise_Task_Map[
          "day_4_deleted"
        ] || 0
     };



     const thursday_Task_obj = {
        completed :
        daywise_Task_Map[
          "day_5_completed"
        ] || 0,

        pending :
        daywise_Task_Map[
          "day_5_pending"
        ] || 0,

        deleted :
        daywise_Task_Map[
          "day_5_deleted"
        ] || 0
     };



     const friday_Task_obj = {
        completed :
        daywise_Task_Map[
          "day_6_completed"
        ] || 0,

        pending :
        daywise_Task_Map[
          "day_6_pending"
        ] || 0,

        deleted :
        daywise_Task_Map[
          "day_6_deleted"
        ] || 0
     };



     const saturday_Task_obj = {
        completed :
        daywise_Task_Map[
          "day_7_completed"
        ] || 0,

        pending :
        daywise_Task_Map[
          "day_7_pending"
        ] || 0,

        deleted :
        daywise_Task_Map[
          "day_7_deleted"
        ] || 0
     };



     // ====================================
     // RESPONSE
     // ====================================

     return res.status(200).json({

        status :true,

        message :
        'Chart data collected successfully',

        data : {

            weekly_Task : {

               pending :
               pending_Weakly_task,

               deleted :
               deleted_Weakly_task,

               completed :
               completed_Weakly_task,

               total :
               total_Weakly_task
            },

            total_Task : {

               pending :
               pending_Total_task,

               deleted :
               deleted_Total_task,

               completed :
               completed_Total_task,

               total :
               total_task
            },

            daywise_Task : {

               sunday :
               sunday_Task_obj,

               monday :
               monday_Task_obj,

               tuesday :
               tuesday_Task_obj,

               wednesday :
               wednesday_Task_obj,

               thursday :
               thursday_Task_obj,

               friday :
               friday_Task_obj,

               saturday :
               saturday_Task_obj
            }
         }
      });
 }
 catch(err){

   console.log(err.message);

   return res.status(500).json({
      message :"Internal server error",
      status : false
   });
 }
};
