import express from "express";
import cors from 'cors';
import userRouter from "./routes/user.router.js";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import { dbName } from "./constants.js";
import dotenv from "dotenv"; 

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use env for security
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // Do not hardcode this!
      dbName: dbName, // if you want to specify dbName; optional based on your config
    }),
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

// Passport middleware should have .initialize() before .session()
app.use(passport.initialize());
app.use(passport.session());

app.use("/user", userRouter);
app.route("/").get((req, res) =>
  res.send("<a href='/user/google/auth'> login with google</a>")
);

export default app;
