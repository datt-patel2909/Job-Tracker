const express=require('express')
const router=express.Router();


const {getAlljobs,getjobs,createjobs, updatejobs,deletejobs}=require('../controllers/jobs')

router.get('/',getAlljobs)
router.get('/:id',getjobs)
router.post('/',createjobs)
router.patch('/:id',updatejobs)
router.delete('/:id',deletejobs)

module.exports=router