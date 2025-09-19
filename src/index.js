import dotenv from "dotenv"; 
dotenv.config() 
import mongoose from "mongoose";
import connect from "./db/connect.js";
import app from "./app.js";
import './auth.js'



 
connect().then(()=>{
    app.listen(process.env.PORT || 3000,()=>console.log("app listening at " + process.env.PORT || 3000))
}).catch((error)=>{
    console.log("express app error : " + error)
});