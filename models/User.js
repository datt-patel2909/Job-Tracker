const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
require('dotenv').config();

const UserSchema=mongoose.Schema({
    name:{
        type: String,
        required:[true,'please provide a name'],
        minlength:3,
        maxlenth:50
    },
    email:{
        type: String,
        required:[true,'please provide a email'],
        minlength:3,
        maxlenth:50,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ],
        unique:true
    },
    password:{
        type: String,
        required:[true,'please provide a password'],
        minlength:6,
        maxlenth:12
    }


})
UserSchema.pre('save', async function(){
    const salt=await bcrypt.genSalt(10)
    this.password=await bcrypt.hash(this.password,salt)
    
})
UserSchema.methods.createJWT=function()
{
    return jwt.sign({userId:this._id,name:this.name},process.env.JWT_SECRET,{expiresIn:process.env.JWT_LIFETIME})
}
UserSchema.methods.comparePassword=async function(candidatepassword)
    {
        const isMatch=await bcrypt.compare(candidatepassword,this.password)
        return isMatch

    }


  module.exports=mongoose.model('User',UserSchema)
