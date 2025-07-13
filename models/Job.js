const mongoose=require('mongoose')

const JobsSchema= mongoose.Schema({
 company:{
    type:String,
    required:[true,'please provide company name'],
    maxlength:50
 },
  position:{
    type:String,
    required:[true,'please provide positon'],
    maxlength:100
 },
  status:{
    type:String,
    enum:[,'interview','declined','pending'],
    maxlength:50,
    default:'pending',
 },
 createdBy:{
    type:mongoose.Types.ObjectId,
    ref:'User',
    required:[true,'please provide user']
 }





},{timestamps:true})

module.exports=mongoose.model('Jobs',JobsSchema)