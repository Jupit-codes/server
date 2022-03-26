

import express from "express";
import Usermodel from '../model/users.js';
import KycModel from '../model/kyc.js';
import Kyc from '../model/kyc.js'
import IdCardVerification from '../model/idcardverification.js'

import axios from "axios";

const router = express.Router();

router.get('/me',(req,res)=>{
    console.log('Welcome to Verify me');
    res.send('Welcome');
    const url = "https://api.verified.africa/sfx-verify/v3/id-service/"
    axios.post(url,{ 
        headers: {
            'Content-Type': 'application/json',
            'apiKey':'4hjQwS9Mw6iAbexvM',
            'userid':'1641124470949',
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
    })
    .then(res=>{
        Usermodel.findByIdAndUpdate(userid, { 
            $push: { 
                    
                    usdt_wallet: {"balance":0,"address":res.data.addresses[0]},
                } 
            }).exec();
        
    })
    .catch((error)=>{
        console.log('error_usdt',console.log(error.response))
        return error.response
    })
    
});

export default router