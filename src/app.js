import express from "express";
import cors from "cors";
import userRouter from "./routes/user.router.js";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import { dbName } from "./constants.js";
import dotenv from "dotenv";
import './auth.js'; 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,  // ✅ Must match your env var
      dbName: dbName,
    }),
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.send("<a href='/user/google/auth'> Login with Google</a>");
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
