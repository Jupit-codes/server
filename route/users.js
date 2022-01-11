import express from "express";
import Usermodel from '../model/users.js';
import KycModel from '../model/kyc.js';
import WebHook from "../model/webhook.js";
import axios from "axios";
import crypto from 'crypto';
import querystring from 'querystring';
import random from 'random-number';
import nodemailer from 'nodemailer';




const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
       auth: {
            user: 'bigdevtemy@gmail.com',
            pass: 'jxubkguwbpebrtlv',
         },
    secure: true,
    });
    

const router = express.Router();

router.get('/',(req,res)=>{
    res.send('Welcome to jupit server');
});
router.get('/users',(req,res)=>{
    res.send('All Users');
});
router.post('/users/login',(req,res)=>{
    console.log(req.body);
    res.send('Login Successful')
});
router.post('/customer_webhook',(req,res)=>{
    console.log('Event',req.body);
    console.log('HelloEvent',req.body.event);
    console.log("EventLog","Event Has Been Recieved")
    res.send(req.body)
    res.status(200).end()
    if(req.body.event){
        KycModel.findOne({customercode:req.body.customercode},function(err,docs){
            if(err){
                res.send(err);
            }
            if(docs){
                KycModel.findOneAndUpdate({customercode:req.body.customercode},{event:req.body.event},function(err,result){
                    if(err){
                        res.send({
                            "err":err,
                            "status":false
                        })
                    }
                    else{
                        res.send({
                            "message":"Resolved",
                            "status":true
                        })
                    }
                })
            }
            else{
                saveWebHook(req.body);
            }
        })
    }
   

    // const mailData = {
    //     from: 'hello@jupit.app',  // sender address
    //     to: 'hademylola@gmail.com',   // list of receivers
    //     subject: 'KYC Level 2 Notification',
    //     text: 'That was easy!',
    //     html: `
    //             <div style="width:100%;height:100vh;background-color:#f5f5f5; display:flex;justify-content:center;align-item:center">
    //                 <div style="width:100%; height:70%;background-color:#fff;border-bottom-left-radius:15px;border-bottom-right-radius:15px;">
    //                     <hr style="width:100%;height:5px;background-color:#1c1c93"/>
    //                     <div style="width:100%;text-align:center">
    //                             <img src="https://jupit-asset.s3.us-east-2.amazonaws.com/manual/logo.png" />
    //                     </div>   
    //                     <div style="width:100%;text-align:center;margin-top:20px">
    //                         <h2 style="font-family:candara">WebHook Notification </h2>
    //                     <div>   
    //                     <div style="width:100%;padding-left:20px;text-align:center;padding-top:10px">
    //                         <hr style="background-color:#f5f5f5;width:95%"/>
    //                     <div>
    //                         <div style="width:100%; text-align:center">
    //                             <p>Dear Client,</p>
    //                             <p>Trust this notification meets you well?</p>
    //                             <p>You Just received a callback response as regards, your KYC Level 2 with US</p>
    //                         </div>
                           
    //                     </div>
    //                     </div>

    //                     <div >
    //                     <p style="color:#dedede">If you have any questions, please contact support@jupit.app</p>
    //                     </div>
    //                 </div>
        
    //             </div>
    //         `
    //   };

    // transporter.sendMail(mailData, function (err, info) {
    //     if(err){
           
    //         res.send({"message":"An Error Occurred","callback":err})
    //     }
        
    //     else{

    //         res.send({"message":"Kindly Check Mail for Account Verification Link","callback":info,"status":true})
            
    //     }
          
    //  });
    
})
router.get('/users/jupit/emailverification/e9p5ikica6f19gdsmqta/qvrse/:id',(req,res)=>{
    console.log(req.params.id);
    // res.send(req.params.id);
   
    Usermodel.findOne({_id: req.params.id }, function (err, docs) {
        if (err){
            console.log(err)
        }
        else{
            if(docs.email_verification){
                res.send({"message":"Email has Already Been Verified"})
            }
            else{
                if(docs){
                    Usermodel.findOneAndUpdate({_id: req.params.id}, {$set:{email_verification:true}}, {new: true}, (err, doc) => {
                        if (err) {
                            res.send({"Errormessage":err,"status":false});
                        }
                        const usdt_add = createUSDTWalletAddress(req.params.id);
                        const btc_add = createBTCWalletAddress(req.params.id);
                        Usermodel.findOne({_id:req.params.id},function(err,docs){
                            if(err){
                                res.send({
                                    "message":"An Error Occurred",
                                    "Error":err,
                                    "status":false
                                })
                            }
                            if(docs){
                                createKyc(docs._id,docs.email,docs.phonenumber);
                                res.send({"SuccessMessage":"EmailAddress Verified","status":true});
                            }
                        })
                        
                        // const update_kyc_level1 = updateKycLevel1(req.params.id);
                        // const update_kyc_level2= updateKycLevel2(req.params.id);
                        
                        
                    });
                }
                else{
                    res.send({"message":"Internal Server Error..try again","status":false})
                }
                     
            }
        }
    });
})

router.post('/users/register',(req,res)=>{
    

    Usermodel.findOne({email:req.body.email},function(err,docs){
        if(err){
            res.send({"message":err,"status":false})
        }
        else{
            if(docs){
                if(docs.email_verification){
                    res.send({"message":"Email Account Already Exist","status":false})
                }
                else{
                    res.send({"message":"Email Verification pending On this Account","status":false})
                }
               
            }
            else{
                createUser();
            }
        }
    })

    
   async function createUser(){
       try{
        const user = await  Usermodel.create({
            username:req.body.username,
            email:req.body.email,
            password:req.body.password,
            phonenumber:req.body.phonenumber,
            email_verification:false
        })
        
      
        // Usermodel.updateOne(
        //     {_id: user._id}, 
        //     {$push: {naira_wallet: {"balance": 0,"address":"020ccccsssssss"}}},{new: true, upsert: true }).exec();
        //     res.sendStatus(200)

        
        // const usdt_add = createUSDTWalletAddress(user._id);
        // const btc_add = createBTCWalletAddress(user._id);

        

        Usermodel.findByIdAndUpdate(user._id, { 
            $push: { 
                    naira_wallet: {"balance":0,"address":"00000"},
                    
                } 
            }).exec();

            const mailData = {
                from: 'hello@jupit.app',  // sender address
                to: req.body.email,   // list of receivers
                subject: 'Email Verification <jupit.app>',
                text: 'That was easy!',
                html: `
                        <div style="width:100%;height:100vh;background-color:#f5f5f5; display:flex;justify-content:center;align-item:center">
                            <div style="width:100%; height:70%;background-color:#fff;border-bottom-left-radius:15px;border-bottom-right-radius:15px;">
                                <hr style="width:100%;height:5px;background-color:#1c1c93"/>
                                <div style="width:100%;text-align:center">
                                        <img src="https://jupit-asset.s3.us-east-2.amazonaws.com/manual/logo.png" />
                                </div>   
                                <div style="width:100%;text-align:center;margin-top:20px">
                                    <h2 style="font-family:candara">Email Verification  </h2>
                                <div>   
                                <div style="width:100%;padding-left:20px;text-align:center;padding-top:10px">
                                    <hr style="background-color:#f5f5f5;width:95%"/>
                                <div>
                                    <div style="width:100%; text-align:center">
                                        <p style="font-family:candara;padding:10px;font-size:16px">To verify your email address, kindly click on the button below</p>
                                        <p style="font-family:candara;font-weight:bold;margin-top:5px;font-size:16px">If you did not make this request, then ignore the email</p>
                                        <a href="http://127.0.0.1:5000/users/jupit/emailverification/e9p5ikica6f19gdsmqta/qvrse/${user._id}" style="cursor:pointer"><button style="width:50%;height:40px;font-family:candara;font-size:18px;font-weight:bold;cursor:pointer;background-color:#ffc857;border:1px solid #ffc857">Verify Email Address</button></a>
                                    </div>
                                    <div style="width:100%; text-align:center">
                                    <p style="font-family:candara;padding:5px">If you have trouble paste below link in your browser</p>
                                    <p style="font-family:candara;padding:5px;color:#1c1c93;font-weight:bold">http://127.0.0.1:5000/users/jupit/emailverification/e9p5ikica6f19gdsmqta/qvrse/${user._id}</p>
                                    </div>
                                </div>
                                </div>

                                <div >
                                <p style="color:#dedede">If you have any questions, please contact support@jupit.app</p>
                                </div>
                            </div>
                
                        </div>
                    `
              };

            transporter.sendMail(mailData, function (err, info) {
                if(err){
                   
                    res.send({"message":"An Error Occurred","callback":err})
                }
                
                else{
                    

                    
                    res.send({"message":"Kindly Check Mail for Account Verification Link","callback":info,"status":true})
                    
                }
                  
             });
            

            // res.send({"message":"User Successfully Registered"})


      
       }
       catch(err){
        console.log(err)
        res.send(err.message)
       }
  
   }
  
})

function createUSDTWalletAddress(userid){
    let rand = random(option_rand);
    var option_rand = {
            min: 48886
            , max: 67889
            , integer: true
        }
    function buildChecksumUSDT(params, secret, t, r, postData) {
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

    var secret="2EL3tBHQ3YWQtg3enSBRfvrLPLWc";
    var time = Math.floor(new Date().getTime() / 1000)
    var postData = {"count":1};

    var buildUSDT = buildChecksumUSDT(null,secret,time,rand,postData);
    const params ={
        "count": 1,}
    
    
        const parameters = {
            t:time,
            r:rand,
        }
        const get_request_args = querystring.stringify(parameters);
        
        // const base_url = "http://demo.thresh0ld.com"
        const url = 'https://demo.thresh0ld.com/v1/sofa/wallets/488433/addresses?'+get_request_args
    
        
    axios.post(url,params,{ 
        headers: {
            'Content-Type': 'application/json',
            'X-API-CODE':'4hjQwS9Mw6iAbexvM',
            'X-CHECKSUM':buildUSDT,
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
}
function createBTCWalletAddress(userid){
        
    let rand = random(option_rand);
    var option_rand = {
            min: 48886
            , max: 67889
            , integer: true
        }
    function buildChecksum(params, secret, t, r, postData) {
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
    var postData = {"count":1};

    var build = buildChecksum(null,secret,time,rand,postData);

    const params ={
    "count": 1,}


    const parameters = {
        t:time,
        r:rand,
    }
    const get_request_args = querystring.stringify(parameters);

    const base_url = "http://demo.thresh0ld.com"
    const url = 'https://demo.thresh0ld.com/v1/sofa/wallets/194071/addresses?'+get_request_args


    axios.post(url,params,{ 
    headers: {
        'Content-Type': 'application/json',
        'X-API-CODE':'4PiVpdbyLJZatLBwR',
        'X-CHECKSUM':build,
        'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
    }
    })
    .then(res=>{
        console.log('btc',res.data.addresses[0])
        Usermodel.findByIdAndUpdate(userid, { 
            $push: { 
                    
                    btc_wallet: {"balance":0,"address":res.data.addresses[0]},
                } 
            }).exec();
    })
    .catch((error)=>{
        console.log('error',error.response)
        return error.response
        
    })
}

async function createKyc(userid,email,phonenumber){
    try{
        const kyc= await  KycModel.create({
            userid:userid
        })

        createCustomerCode(kyc._id,email,phonenumber);

        // KycModel.findByIdAndUpdate(kyc._id, { 
        //     $push: { 
        //             level1: {"status":"verified"}, 
        //         } 
        //     }).exec();


    }
    catch(err){
        res.send({
            "message":"An Error Occurred",
            "error":err,
            "status":false
        })
        console.log(err)
    }
}

function createCustomerCode(kyc_id,email,phonenumber){
    console.log(kyc_id,email,phonenumber)
    const url ="https://api.paystack.co/customer";
    const params = {
        "email":email,
        "phonenumber":phonenumber
    }
    axios.post(url,params,{
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer sk_live_e17b8c11ebd06acf37e6999d97ce43e7b1711a57'
           
        }
    })
    .then(res=>{
        console.log('CustomerCode',res.data.data.customer_code);
        console.log('res',res)
        KycModel.findByIdAndUpdate(kyc_id, { 
            $push: { 
                    naira_wallet: {"balance":0,"address":"00000"},
                    level1:{
                        "email":email,
                        "status":"Verified"
                    },
                    level2:{
                        "email":email,
                        "customer_code":res.data.data.customer_code,
                        "integration":res.data.data.integration,
                    }
                    
                } 
            }).exec();
            console.log('Kyc Successfully Created')
            // res.send({"SuccessMessage":"EmailAddress Verified","status":true});
    })
    .catch((err)=>{
        // res.send({
        //     "message":"An Error Occurred",
        //     "error":err,
        //     "status":false
        // })
        console.log(err)
    })
}


router.post('/users/validate/acountnumber',(req,res)=>{
    const account_number = req.body.account_number;
    const bankcode = req.body.bankcode;
    const parameters = {
        account_number:account_number,
        bank_code:bankcode,
    }
    const get_request_args = querystring.stringify(parameters);
    const url = "https://api.paystack.co/bank/resolve?"+get_request_args
    axios.get(url,{
        headers:{
            'Content-Type':'application/json',
            'Authorization':'Bearer sk_live_e17b8c11ebd06acf37e6999d97ce43e7b1711a57'
        }
    })
    .then(result=>{
       
         if(result.data.message === "Account number resolved"){
             res.send({
                 "Message":"Resolved"
             })
         }
         
        console.log(result.data)
    })
    .catch((err)=>{
        res.send({
            "Message":"Failed"
        })
        console.log(err)
    })


});

router.post('/users/validate/bvntoaccount/kyc/level2',(req,res)=>{
    const account_number = req.body.account_number;
    const bankcode = req.body.bankcode;
    const bvn = req.body.bvn;
    const customer_code = req.body.customer_code
    console.log(account_number,bankcode,bvn,customer_code)
    const url = `https://api.paystack.co/customer/${customer_code}/identification`;
    const params={
        "country": "NG",
        "type": "bank_account",
        "account_number": account_number,
        "bvn": bvn,
        "bank_code": bankcode,
        "first_name": "",
        "last_name": ""
    }
        axios.post(url,params,{
            headers: {
                "Content-Type": "application/json",
                'Authorization':'Bearer sk_live_e17b8c11ebd06acf37e6999d97ce43e7b1711a57' 
            }
        })
        .then(result=>{

            res.send({
                "message":result.data
            })
            console.log("here",result.data)
        })
        .catch((err)=>{
            res.send({
                "err":err.response.data
            })
            err.response ? console.log("errData",err.response.data) :console.log("errAll",err)
            
        })

});

async function saveWebHook (json){
    try{
        const webhook = await WebHook.create({
            event:json.event,
            customerid:json.data.customer_id,
            customercode:json.data.customer_code,
            email:json.data.email,
            bvn:json.data.identification.bvn,
            accountnumber:json.data.identification.account_number,
            bankcode:json.data.identification.bank_code,
        })
        
        console.log('WebhookSaved')
    }
    catch(err){
        console.log(err)
    }
}





export default router;