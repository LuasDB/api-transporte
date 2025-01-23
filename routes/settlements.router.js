const express = require('express');
const router = express.Router();
const Boom = require('@hapi/boom')

const Settlement = require('../services/settlement.service.js')

const settlement = new Settlement()

router.get('/new',async(req, res)=>{
  try {
    const init = await settlement.getData()
    res.status(200).json({
      success:true,
      data:init
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message:'Error en el servidor'
    })
  }
})



module.exports= router
