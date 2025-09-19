import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js";
import {User} from"../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import passport from "passport";
import { quizMap } from "../constants.js";
import axios from "axios";

const userRegister = asyncHandler(async (req,res)=>{
   const {userName,email,password} = req.body;
    
    Object.entries({userName,email,password}).forEach(([key,value])=>{
        if(!value || value.trim() == "")throw new ApiError(400,key + " is required")
    })

    const emailRegex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email?.trim()))throw new ApiError(400,"email invalid")
    
    if(await User.findOne({ email })) throw new ApiError(
        409, "User with same email already exists"
    )

    const user = await User.create({
        userName,
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select("-password -_id");
    if(!createdUser)throw new ApiError(500)
    
    return res.status(201).json(new ApiResponse(201,createdUser,"user Created"))
})
const userLogin = passport.authenticate("local",{failureRedirect:"/login-failed",successRedirect:"/"});
const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });
const userLogout = asyncHandler(async (req,res)=>{
  
})
const googleCallback = (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (info && info.message === "require linking") {
        req.session.pendingLink = {
          googleId: info.profile.id,
          email: info.profile.emails[0].value
        };
        return res.redirect(`/link-account?email=${info.email}`);
      }
      if (err) return next(err);
      if (!user) return res.redirect('/login-fail');

      req.logIn(user, (err) => {
        if (err) return res.status(300).json(new ApiError(300,err));
        res.json(new ApiResponse(200,"user logged in"))
        return res.redirect('/');
      });
    })(req, res, next);
  }
const linkGoogle = asyncHandler(async (req,res)=>{
  const pending = req.pendingLink;
  if(!pending)return res.status(300).json(new ApiError(300,"no pending linking"));
  if(pending.email){ 
    const user = await User.findOne({email});
    if(!user)return res.status(300).json(new ApiError(300,"account not found"));
    user.googleId = pending.googleId;
    await user.save();

    req.session.pendingLink = null;
    req.logIn(user, (err) => {
        if (err) return res.status(300).json(new ApiError(300,err));
        res.ApiResponse(200,"user logged in")
        return res.redirect('/');
      });
  }
})
const submitQuiz = asyncHandler(async(req,res)=>{
  const quizRes = req.body.quizResponse;
  if(!quizRes)throw new ApiError(400,"no quizRes")
  const mlReq={};
  for(const key in quizMap){
    if(!quizRes.hasOwnProperty(key))throw new ApiError(400,`incomplete quiz, answer question ${key}`)
    if(!quizMap[key][quizRes[key]])throw new ApiError(400,"invalid quizrespnse")
    for (const [prop,propValue] of Object.entries(quizMap[key][quizRes[key]])) {   
      if(mlReq[prop]) mlReq[prop]+= propValue;  
      else mlReq[prop]=propValue;  
    }
  
    // const prop = Object.keys(quizMap[key][quizRes[key]])[0];
    // const propValue = quizMap[key][quizRes[key]][prop]
    // if(!prop || !propValue)throw new ApiError(401,"invalid quizRes")
    // if(mlReq[prop]) mlReq[prop]+= propValue;  
    // else mlReq[prop]=propValue;
  }
  let mlRes;
  try{
    mlRes = await axios.post(`${process.env.MLURI}/predict_stream`);
  }
  catch{
    throw new ApiError(300,"ml model error")
  }
  if(!mlRes|| mlRes.body ||!mlRes.body.predicted_stream || !mlRes.body.confidence)throw new ApiError(300,"ml model error");
  req.user.stream = mlRes.body
  req.user.save();
  return res.status(200).json(req.user.select("-password -_id"))
})
export {
  googleAuth,
  userRegister,
  userLogin,
  googleCallback,
  submitQuiz,
  linkGoogle
}; 