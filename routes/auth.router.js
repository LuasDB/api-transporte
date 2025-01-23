const express = require('express');
const router = express.Router()
const multer = require('multer');
require('dotenv').config();
const uploadNone = multer();

const Auth = require('../services/auth.service')
const auth = new Auth();


router.post('/login',uploadNone.none(),async(req,res)=>{

 try {
  const login = await auth.login(req.body)
  res.status(201).json(login)

 } catch (error) {
  res.status(500).json({success:false,message:'Algo salio mal',error})
 }

})

router.post('/register',async(req,res,next)=>{

  try {
    const register = await auth.create(req.body);
    res.status(201).json(register)

  } catch (error) {
   next(error)
  }
})

router.get('/users',async(req,res)=>{
  try {
    const users = await auth.getAll();
    res.status(users.status).json(users)
  } catch (error) {
    res.status(500).json({success:false, error})
  }
})

router.post('/sol-password',async(req,res)=>{
  try {
    const users = await auth.solPassword(req.body);
    console.log('RES',users)
    res.status(users.status).json(users)
  } catch (error) {
    res.status(500).json({success:false, error})
  }
})

router.get('/users/:id',async(req,res)=>{
  const { id } = req.params
  try {
    const users = await auth.getOne(id);
    res.status(users.status).json(users)
  } catch (error) {
    res.status(500).json({success:false, error})
  }
})

router.patch('/users/:id',uploadNone.none(),async(req,res)=>{
  const { id } = req.params

  try {
    const user = await auth.updateOne(id,req.body);
    res.status(user.status).json(user)
  } catch (error) {
    res.status(500).json({success:false, error})
  }
})

router.post('/reset-password',uploadNone.none(), async (req, res) => {
  try {
    const resetPass = await auth.resetPassword(req.body)
    res.status(resetPass.status).json(resetPass);
  } catch (error) {
    res.status(resetPass.status).json({success:false, message:error});
  }
});


module.exports = router
