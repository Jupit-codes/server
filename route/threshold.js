import express from 'express';
import axios from "axios";
import crypto from 'crypto';
import querystring from 'querystring';
import random from 'random-number';
import Usermodel from '../model/users.js';


const Router  = express.Router();

Router.post('/getautofee',(req,res)=>{

    let rand = random(option_rand);
    var option_rand = {
            min: 48886
            , max: 67889
            , integer: true
        }
    function build(params, secret, t, r, postData) {
        const p = params || [];
        p.push(`t=${t}`, `r=${r}`);
        if (!!postData) {
            if (typeof postData === 'string') {
                    p.push(postData);
            } else {
                    p.push(JSON.stringify(postData));
            }
        }
        p.sort();
        p.push(`secret=${secret}`);
        return crypto.createHash('sha256').update(p.join('&')).digest('hex');
    }

    var secret="3A84eebqYqeU3HaaXMcEAip8zBRS";
    var time = Math.floor(new Date().getTime() / 1000)
    // var postData = [{ "block_num": [1] }]
    const params = ['{"block_nums":[1,50,100]}'];

    var CHECKSUM = build(params,secret,time,rand);


    const parameters = {
        t:time,
        r:rand,
    }
    
    const get_request_args = querystring.stringify(parameters);
   
    const url = 'https://demo.thresh0ld.com/v1/sofa/wallets/194071/autofees?'+ get_request_args
    
    const new_params = {
        "block_nums": [1,50,100]
    }
   axios.post(url,new_params,{
        headers: {
            'Content-Type': 'application/json',
            'X-API-CODE':'4PiVpdbyLJZatLBwR',
            'X-CHECKSUM':CHECKSUM,
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
   })
   .then((result)=>{
       console.log(result.data['auto_fees'][0]['auto_fee'])
        
        res.send({
           "message":result.data,
            "status":true
        })
        
   })
   .catch((err)=>{
       console.log(err)
       res.send({
           "message":err,
           "status":false
       })
   })
})

Router.post('/incoming/depositcallback/',(req,res)=>{
    console.log(req.body);
})

Router.post('/transfer/asset',(req,res)=>{
    const userid = req.body.userid;
    const wallets_type = req.body.wallet_type;
    
   let User =  Usermodel.findById({_id:userid},function(err,docs){
        if(err){
            res.send({
                "message":err.data,
                "status":false
            })
        }
        if(docs){
            // res.send(docs)
            if(wallets_type === "BTC"){
                // res.send({
                //     'message':'Done',
                //     "details":docs.btc_wallet[0].address
                // })
                let callback = creditWalletAddress(docs._id,docs.btc_wallet[0].address,wallets_type)
                res.send(callback);
            }
            if(wallets_type === "USDT"){
               
                let callback = creditWalletAddress(docs._id,docs.btc_wallet[0].address,wallets_type)
                res.send(callback);
            }
            
            
        }
        else{
            res.send({
                "message":"Userid not Found",
                "status":false
            })
        }
    })

    
});

function creditWalletAddress(userid,address,wallet_type){
    let secret="";
    let apikey = "";
    
    if(wallet_type === "BTC"){
        secret="44bJugkgbvhzqaMiQ3inE8Hebeka";
        apikey = "4W1Pg2CeHQMS8hHGr";
    }
    else if(wallet_type === "USDT"){

    }
    else{
        return "Invalid Wallet Type"
    }


    let rand = random(option_rand);
    var option_rand = {
            min: 48886
            , max: 67889
            , integer: true
        }
    function build(params, secret, t, r, postData) {
        const p = params || [];
        p.push(`t=${t}`, `r=${r}`);
        if (!!postData) {
            if (typeof postData === 'string') {
                    p.push(postData);
            } else {
                    p.push(JSON.stringify(postData));
            }
        }
        p.sort();
        p.push(`secret=${secret}`);
        return crypto.createHash('sha256').update(p.join('&')).digest('hex');
    }

    // var secret="44bJugkgbvhzqaMiQ3inE8Hebeka";
    var time = Math.floor(new Date().getTime() / 1000);

    var params = {
        "requests": [
          {
            "order_id": "187795_"+userid,
            "address": address,
            "amount": "0.0001",
            "memo": "memo-"+userid,
            "user_id": userid,
            "message": "message-"+userid,
            "block_average_fee": 5
          },
        //   {
        //     "order_id": "187795_2",
        //     "address": "0xf16B7B8900F0d2f682e0FFe207a553F52B6C7015",
        //     "amount": "0.0002",
        //     "memo": "memo-002",
        //     "user_id": "USER02",
        //     "message": "message-002",
        //     "manual_fee": 50
        //   },
        //   {
        //     "order_id": "187795_2",
        //     "address": "0x9638fa816ccd35389a9a98a997ee08b5321f3eb9",
        //     "amount": "0.0002",
        //     "memo": "memo-003",
        //     "user_id": "USER03",
        //     "message": "message-003"
        //   }
        ],
        "ignore_black_list": false
      }
    

    var CHECKSUM = build(null,secret,time,rand,params);

      
    const parameters = {
        t:time,
        r:rand,
    }
 
    const get_request_args = querystring.stringify(parameters);
   
    const url = 'https://demo.thresh0ld.com/v1/sofa/wallets/678693/sender/transactions?'+ get_request_args
    
   
   axios.post(url,params,{
        headers: {
            'Content-Type': 'application/json',
            // 'X-API-CODE':'4W1Pg2CeHQMS8hHGr',
            'X-API-CODE':apikey,
            'X-CHECKSUM':CHECKSUM,
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
   })
   .then((result)=>{
       console.log('result',result)
       
       return [
            {
                "success":result,
                "status":true
            }
        ]
        
        // res.send({
        //    "message":result.data,
        //     "status":true
        // })
        
   })
   .catch((err)=>{
       console.log('err',err)
       return [
            {
                "error":err,
                "status":false
            }
         ]
    //    res.send({
    //        "message":err,
    //        "status":false
    //    })
   })
}


export default Router;