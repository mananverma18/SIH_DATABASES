import mongoose from "mongoose";
import { dbName } from "../constants.js";

export default async function(){
    try {
        const connectionInstance= mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`);
        console.log("DB Connected")
        return connectionInstance;
    } catch (error) {
        console.log("DB Connection Error : " + error);
        process.exit(1);
    }
}