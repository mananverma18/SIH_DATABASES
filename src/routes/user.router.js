import { Router } from "express";
import { userRegister,googleAuth, googleCallback, userLogin, submitQuiz, linkGoogle } from "../controlers/user.controler.js";

// "/user"
const userRouter = Router();

userRouter.route("/register").post(userRegister)
userRouter.route("/google/auth").get(googleAuth)
userRouter.route("/login").post(userLogin)
userRouter.route("/googlecallback").get(googleCallback)
userRouter.route("/googlecallback").get(googleCallback)
userRouter.route("/streamQuiz").post(submitQuiz)



export default userRouter;