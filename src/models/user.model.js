import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    googleId:{
        type:String,
    },
    userName:{
        type: String,
        required:true,
        trim: true,
    },
    email:{
        type: String,
        required:true,
        unique:true,
        lowercase: true,
        trim: true,
    },
    password:{
        type: String,
    },
    stream:{
    predicted_stream:String,
    confidence:Number,
    }
},{
    timestamps: true,
})

userSchema.pre('save', async function(next){
    if(this.isModified("password"))this.password= await bcrypt.hash(this.password,8);
    next();
})
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password);
    //compares password given as param to encrypted password in db, returns boolean
}

export const User = mongoose.model('User', userSchema);

// logical:{
//             type:Number,
//             default:0,
//         },
//         numerical:{
//             type:Number,
//             default:0,
//         },
//         verbal:{
//             type:Number,
//             default:0,
//         },
//         medical:{
//             type:Number,
//             default:0,
//         },
//         nonmedical:{
//             type:Number,
//             default:0,
//         },
//         commerce:{
//             type:Number,
//             default:0,
//         },
//         arts:{
//             type:Number,
//             default:0,
//         },
//         vocational:{
//             type:Number,
//             default:0,
//         }
    