import './src/config/env_loader.js' ;
import express from 'express' ;
import mongoose from 'mongoose';
import Connect_Db from "./src/config/dbs.js";
import redis from "./src/config/redis.js";
import cors from "cors";
import authRoutes from "./src/routes/authentication/index.js";
import cookieParser from "cookie-parser";
import Task_routes from './src/routes/task/tasks_routes.js' ;
import accountRoutes from './src/routes/account/index.js' ;

const app = express() ;

app.use(cookieParser());

// now set cross orgin resource shareing system
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

app.use(express.json()) ;

// now connect database
try{
  await Connect_Db() ;
  console.log("conected to database from to_do_server.js") ;
}
catch(err){
  console.log(err.message) ;
}

app.use("/api",authRoutes) ;
app.use("/task-API",Task_routes) ;
app.use("/account-API",accountRoutes) ;

const port = 8080 ;

app.listen(port ,()=>{
  console.log("connected to backend on port ",{port}) ;
}) ;