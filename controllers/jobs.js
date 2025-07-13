const Jobs=require('../models/Job')
const {StatusCodes}=require('http-status-codes')
const{NotFoundError,BadRequestError}=require('../errors/index')
const Job = require('../models/Job')

const getAlljobs=async(req,res)=>{
        const job=await Jobs.find({createdBy:req.user.userId}).sort('createdAt')
    res.status(StatusCodes.OK).json({job,count:job.length})
}

const getjobs=async(req,res)=>{
    const {user:{userId},params:{id:jobId}}=req

    const job=await Job.findOne({
        _id:jobId,createdBy:userId
    })

    if(!job)
    {
        throw new NotFoundError(`No jobs with ${jobId}`)
    }
    res.status(StatusCodes.OK).json({job})
}

const createjobs=async(req,res)=>{
    req.body.createdBy=req.user.userId

    const job=await Job.create(req.body)
    res.status(StatusCodes.CREATED).json({job})
}

const updatejobs=async(req,res)=>{
    
     const {body:{company,position},user:{userId},params:{id:jobId}}=req
     if(company==='' || position==='')
     {
        throw new BadRequestError('Company or position fields cannot be empty')
     }
     const job=await Jobs.findOneAndUpdate({_id:jobId,createdBy:userId},req.body,{new:true,runValidators:true})
     
    if(!job)
    {
        throw new NotFoundError(`No jobs with ${jobId}`)
    }
    res.status(StatusCodes.OK).json({job})
}

const deletejobs=async(req,res)=>{
    const {user:{userId},params:{id:jobId}}=req
    
     const job=await Jobs.findOneAndDelete({_id:jobId,createdBy:userId})
     
    if(!job)
    {
        throw new NotFoundError(`No jobs with ${jobId}`)
    }
    res.status(StatusCodes.OK).send()
}


module.exports={getAlljobs,getjobs,createjobs, updatejobs,deletejobs}