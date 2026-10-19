import express from "express"
import { Task_middleware ,auth_Middleware} from "../../middleware/Tasks/task_Auth_middelware.js";
import { Task_adding_and_24hrs_pending_task_controller,Task_deleting_controller,Task_edit_controller,Task_history_controller,Task_Complete_controller} from "../../controllers/task_controller.js";
import {task_Chart_controller} from '../../controllers/task_chart_controller.js';
import { Otp_sender } from "../../middleware/authentication/email_verifier_otp_sender-verifier.js";

const router = express.Router() ;

// task adding route
router.post('/task_Add',(req,res,next)=>{
  req.purpose = "task_Create"
  next() ;
},auth_Middleware,Task_middleware,Task_adding_and_24hrs_pending_task_controller) ;

router.post('/task_24hrs_History',(req,res,next)=>{
  req.purpose = "last_24hrs_History"
  next() ;
},auth_Middleware,Task_adding_and_24hrs_pending_task_controller) ;

// task edit route
router.patch('/task_Edit',auth_Middleware,Task_middleware,Task_edit_controller) ;

// task edit cancel req
router.delete('/task_edit_cancel',(req , res,next)=>{
    req.purpose = "edit_Task_cancel" ;
    next() ;
},auth_Middleware) ;

// task del route
router.delete('/task_Del',auth_Middleware,Task_deleting_controller) ;

// history last 24 hours pending tasks
router.post('/taskHistory',auth_Middleware,Task_history_controller) ;

// task completion route when task completed update the status
router.post('/task_Complete',auth_Middleware,Task_Complete_controller) ;

// dashboard data route
router.post('/task_Dashboard_data',auth_Middleware,task_Chart_controller) ;

export default router ;