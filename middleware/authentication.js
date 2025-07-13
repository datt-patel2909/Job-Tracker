const User=require('../models/User')
const jwt=require('jsonwebtoken')
const{UnauthenticatedError}=require('../errors/index')
const auth=async (req,res,next)=>{
    const authheader=req.headers.authorization
    if(!authheader || !authheader.startsWith('Bearer'))
    {
        throw new UnauthenticatedError('Authentication Invalid')
    }
    const token=authheader.split(' ')[1]

    try {
        const payload=jwt.verify(token,process.env.JWT_SECRET)
        req.user={userId:payload.userId,name:payload.name}
        next()
    } catch (error) {
        throw new UnauthenticatedError('Authentication Invalid')
    }




}
module.exports=auth