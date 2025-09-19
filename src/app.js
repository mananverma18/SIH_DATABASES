import express from "express";
import cors from 'cors';
import userRouter from "./routes/user.router.js";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import { dbName } from "./constants.js";
import dotenv from "dotenv"; 
dotenv.config() 

const app = express();
app.use(cors({origin: process.env.CORS_ORIGIN,credentials:true}));
app.use(express.json({limit:"16kb",}));
app.use(express.urlencoded({limit:"16kb", extended:true,}));
app.use(express.static("public"));
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI  }),
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}))
app.use(passport.session())
app.use(passport.initialize())

app.use("/user",userRouter);
app.route("/").get((req,res)=>{res.send("<a href='/user/google/auth'> login with google</a>")})


export default app;
