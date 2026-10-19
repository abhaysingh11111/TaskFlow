import task_Dbs from '../../models/Tasks_schema.js';
import redis from "../../config/redis.js";
import jwt from "jsonwebtoken";
import { cancelMap } from "../../store/cancelMap.js";

// exported task middleware isme user task syntax check hoga
 export const Task_middleware = (req , res, next)=>{

    const task = req.body.task ;

    // check kya token empty toh nhi hai
    if(!task || task.trim() === ""){
        return res.status(400).json({
            status:false , message :"task is missing"
        })
    }
     const task_Regex =/^[\w\s.,!?()@#%-]{3,100}$/;

      if(!task_Regex.test(task)){ // checking task syntax if syntax is wromg that come in if block
         return res.status(400).json({
            status:false , message:"Invalid task format"
         }) ;
      }
          console.log("taskk regex cross going to controller ") ;

      // when task syntax is fine
      next() ; // call to create new task function or edit any task function or del any task function
 }

 // isme user ka token check hoga
 export const auth_Middleware = async(req, res,next) =>{

     const token = req.cookies.token;
      // when token is missing
      if(!token){ // 401 means missing data
          return res.status(401).json({
             status:false , message :"token missing"
          })
      }

   try{
       // now verify the token is it genuine
       const decoded = jwt.verify(token, process.env.JWT_SECRET);

       // now attach token for controller
       req.user_Id = decoded.id ;

    /* jab req task edit in between cancel ki aaye hi
      step 1 token is verified now step 2  match that does same task id which came has linked with that id dbs */
   if(req.flow === "edit_Task_cancel"){

         const task_Id = req.body.task_Id;
         // jab task id block ho for 24hrs
        const is_blocked = await redis.get(`block_task-id:${task_Id}`); ;

         if(is_blocked ){
            return res.status(403).json({
                status  : false , message :"task id blocked max cancel req reached" ,purpose:"blocked_Task-id"
            })
         }

    // yha pe user task dbs  ko access karke user token key ka use karke dekhenege ki kya koi task id is name se hai isme ya fake hai task id
    try{
        // jab task id first time aayi hi
        if (!await redis.exists(`task_Id:${task_Id}`)) {
            await redis.hSet(`task_Id:${task_Id}`, {
               attempt: 1
            });
            // abhi user ki task id del bhi karni hai under 24hrs
            await redis.expire(`task_Id:${task_Id}`,86400) ;
        }

      // jab task id already registered hai
      else{
         // jab limit of cancel 20 ho jaaye tab block task id wale redis me task id add kar do
         const attempt = await redis.hIncrBy(`task_Id:${task_Id}`,"attempt", 1);

         // check karo limit hit hui ya nahi
         if(attempt >= 20) {
           // block mark kar do
          await redis.setEx(
             `block_task-id:${task_Id}`,
              86400,
           "blocked"
          );
           // optionally response bhej
           console.log("Task blocked 🚫");
         }
      }

         const is_Linked_task_id = await task_Dbs.findOne({userId:  req.user_Id ,_id: task_Id}) ;

          if(!is_Linked_task_id){ // when task id is not linked with user
            return res.status(404).json({
               message: "Task not found" , status : false
            });
          }
          else{ // now map the task id
             cancelMap.set(task_Id, true);
             return  res.status(200).json({
                status : true , message  : "Task id mapped in cancel req map"
             });
          }
     }
     catch(err){
        console.log(err.message) ;
        return res.status(500).json({
              status : false , message : "Internal server error"
        })
     }
   }
     console.log("calling to next func from auth midelware") ;
      next() ; // calling to next function
   }
   catch(err){
      console.log(err.message) ;
      return res.status(403).json({ // means token came  but invalid
         status: false , message:"invalid token"
      })
   }
  }