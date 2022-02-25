import express from "express";
import Usermodel from '../model/users.js';
import KycModel from '../model/kyc.js';
import WebHook from "../model/webhook.js";
import Kyc from '../model/kyc.js'
import IdCardVerification from '../model/idcardverification.js'
import axios from "axios";
import crypto from 'crypto';
import querystring from 'querystring';
import random from 'random-number';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import path from 'path';
import AWS from 'aws-sdk'
import multer from "multer";
import { cwd } from "process";

const upload = multer({ dest: 'uploads/' })


const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
       auth: {
            user: 'hademylola@gmail.com',
            pass: 'wrumrgkuoalcclmc',
         },
    secure: true,
    });
    

const router = express.Router();

router.get('/kyc',(req,res)=>{
    // console.log(path.basename(path.resolve(`${'./aws.json'}`)));
    console.log(process.cwd())
    res.send('Welcome to jupit server');
});

router.post('/users/kyc',middlewareVerify,(req,res)=>{
   
    Kyc.findOne({userid:req.body.userid},function(err,docs){
        if(err){
            res.status(403).send(err);
        }
        else if(docs){
            res.send(docs)
        }
    })
})

router.post('/users/idcardverification',(req,res)=>{
    
    console.log("app",req.body.CapturedImage);
  
   
    AWS.config.loadFromPath(`${process.env.PWD}/route/aws.json`);

    var s3Bucket = new AWS.S3( { params: {Bucket: 'idcardverification'} } );
    const buf = Buffer.from(req.body.CapturedImage.replace(/^data:image\/\w+;base64,/, ""),'base64')

    var data = {
        Key: req.body.userid, 
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg'
      };
      s3Bucket.putObject(data, function(err, data){
          if (err) { 
            console.log(err);
            console.log('Error uploading data: ', data); 
          } else {
            console.log('successfully uploaded the image!');
          }
      });
    res.send("Okay");

   
    
})


router.get('/users/test',middlewareVerify,(req,res)=>{
    res.json({
        "Message":"Header Is Present",
        "token":req.token

    })
})
router.get('/users',(req,res,next)=>{
    
    const bearerHeader = req.headers['authorization'];
    console.log(bearerHeader)

    if(typeof bearerHeader === "undefined" || bearerHeader === ""){
        res.sendStatus(403)
    }
    else{
        const bearerToken = bearerHeader.split(' ')[1];
        
        
        jwt.verify(bearerToken,'secretkey',(err,authData)=>{
            if(err){
                res.sendStatus(403);
            }
            else{

                Usermodel.find({},(err,users)=>{
                    if(err){
                        res.json({
                            'message':err,
                            'status':false
                        })
                    }
                    else if(users){
                        res.send({
                            'message':users,
                            'status':true,
                            authData
                        })
                    }
                    else{
                        res.send({
                            'message':'NO User Found',
                            'status':true,
                            authData
                        })
                    }
                })
                
            }
        })

    }
    
    // if(typeof bearerHeader !== "undefined"){
    //     const bearerToken = bearerHeader.split(' ')[1];
    //     req.token = bearerToken;
    //     console.log('token',req.token)
    // }
    // else{
    //     res.sendStatus(403);
    // }
    

});

router.post('/users/refresh',middlewareVerify,(req,res)=>{
   
    console.log('UserID',req.body._id)
    Usermodel.findOne({_id:req.body._id},function(err,docs){
        if(err){
            res.status(403).send(err)
        }
        if(docs){
           
            res.send(docs)
        }
        else if(!docs){
            res.status(403).send('User Not Found')
        }
    }).clone();
})

router.post('/users/test',middlewareVerify,(req,res)=>{
    console.log(req.body)
})



router.post('/users/login',(req,res)=>{
  console.log(req.body)
    Usermodel.findOne({email:req.body.email},async (err,docs)=>{
        if(err){
            res.send({
                'message':err,
                'status':false
            })
        }
        else if(docs){
            
            const validPassword = bcrypt.compareSync(req.body.password, docs.password);
            console.log(validPassword)
            if (validPassword) {
                jwt.sign({user:docs},'secretkey',(err,token)=>{
                    res.json({
                        token,
                        docs,
                        'status':true
                    })
                })
            
            } else {
                // res.sendStatus(404).send({'message':'Invalid Password',
                // 'status':false})
                // res.send({
                //     'message':'Invalid Password',
                //     'status':false
                // })
                // res.statusMessage = "Invalid Password";
                // res.send(400).end();

                res.status(400).send('Invalid Password');
            }
             
        }
        else{
            // res.sendStatus(404).send({'message':'Invalid Username',
            //     'status':false})
            res.status(400).send('Invalid Email Address');
           
        }
    })
    // res.send('Login Successful')
});


router.post('/customer_webhook',(req,res)=>{
    console.log('Event',req.body);
    console.log('HelloEvent',req.body.event);
    console.log("EventLog","Event Has Been Recieved")
    res.send(req.body)
    res.status(200).end()
    if(req.body.event){
        // KycModel.findOne({customercode:req.body.customercode},function(err,docs){
        //     if(err){
        //         res.send(err);
        //     }
        //     if(docs){
        //         console.log('I found An Existing');
        //         updateWebHook(req.body)
        //     }
        //     else{
        //         console.log('New Entry');
        //         saveWebHook(req.body);
        //     }
        // })
        updateWebHook(req.body);
        saveWebHook(req.body);
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
                                // res.redirect('http://localhost:3000/client/signin')
                                res.status(200).redirect("https://www.google.com")
                                //res.send({"SuccessMessage":"EmailAddress Verified","status":true});
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
            res.status(400).send(err);
        }
        else{
            if(docs){
                if(docs.email_verification){
                    
                    res.status(400).send("Email Account Already Exist");
                }
                else{
                    res.status(400).send("Email Verification pending On this Account")
                    // res.send({"message":"Email Verification pending On this Account","status":false})
                }
               
            }
            else{
                Usermodel.findOne({username:req.body.username},function(err,docs){
                    if(err){
                        res.status(400).send(err);
                    }
                    else if(docs){
                        res.status(400).send("Username Already Exist");

                    }
                    else{
                        createUser();
                    }
                })
                
            }
        }
    })



    
   async function createUser(){

    

       try{
            const salt =  bcrypt.genSaltSync(10);
            const user = await Usermodel.create({
            username:req.body.username,
            email:req.body.email,
            password: bcrypt.hashSync(req.body.password, salt),
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
                                        <a href="https://myjupit.herokuapp.com/users/jupit/emailverification/e9p5ikica6f19gdsmqta/qvrse/${user._id}" style="cursor:pointer"><button style="width:100%;height:40px;font-family:candara;font-size:18px;font-weight:bold;cursor:pointer;background-color:#ffc857;border:1px solid #ffc857">Verify Email Address</button></a>
                                    </div>
                                    <div style="width:100%; text-align:center">
                                    <p style="font-family:candara;padding:5px">If you have trouble paste below link in your browser</p>
                                    <p style="font-family:candara;padding:5px;color:#1c1c93;font-weight:bold">https://myjupit.herokuapp.com/users/jupit/emailverification/e9p5ikica6f19gdsmqta/qvrse/${user._id}</p>
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
                        "event_status":"undefined"
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


router.post('/users/validate/acountnumber',middlewareVerify,(req,res)=>{
    const account_number = req.body.account_number;
    const bank_code = req.body.bank_code;
    const parameters = {
        account_number:account_number,
        bank_code:bank_code,
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
       console.log(result)
         if(result.data.message === "Account number resolved"){
             res.send({
                 "Message":" Account Resolved",
                 "data":result.data
             })
         }
         
       
    })
    .catch((err)=>{
        res.status(403).send('Account Unresolved')
        console.log(err)
    })


});



router.post('/users/validate/bvntoaccount/kyc/level2',middlewareVerify, async(req,res)=>{


    const account_number = req.body.account_number;
    const bankcode = req.body.bankcode;
    const bvn = req.body.bvn;
    // const customer_code = req.body.customer_code
    const emailaddress = req.body.email
    // console.log(account_number,bankcode,bvn,customer_code)

    let CreateCustomerCode = await customer_code_fetch(emailaddress)
        if(CreateCustomerCode[1]){
            // res.send(CreateCustomerCode[0])
            const url = `https://api.paystack.co/customer/${CreateCustomerCode[0]}/identification`;
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
                
            })
            .catch((err)=>{
                res.send({
                    "err":err.response.data
                })
                err.response ? console.log("errData",err.response.data) :console.log("errAll",err)
                
            })
        }
        else{
            res.status(403).send(err);
        }

    return false;
    

});

async function customer_code_fetch(emailaddress){
    const url = `https://api.paystack.co/customer`;
    const params={
        "email":emailaddress,
        "first_name":"",
        "last_name":"",
        "phone":""
    }
    let cust_code = await axios.post(url,params,{
        headers: {
            "Content-Type": "application/json",
            'Authorization':'Bearer sk_live_e17b8c11ebd06acf37e6999d97ce43e7b1711a57' 
        }
    })
    .then(result=>{
        console.log(result.data.data.customer_code)
        return [result.data.data.customer_code,true];
        
    })
    .catch((err)=>{
        console.log(err.response)
        return[ err.response,false];
        
        
    })
    return cust_code;
}

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
async function updateWebHook(json){
    
    //let res = await KycModel.findOneAndUpdate({customercode:json.data.customer_code},{event_status:json.event},{new:true})
//    let res = await  KycModel.findOneAndUpdate({customercode:json.data.customer_code}, { 
//         $push: { 
//                 'level2.0': [{"event_status":json.event},{"event_status":json.event}],
                
//             } 
       
//         }).exec();
    let res = await KycModel.findOneAndUpdate({customercode:json.data.customer_code,'level2.email':json.data.email},{'level2.$.event_status':json.event},null,(err)=>{
        if(err){
            console.log('Error',err)
        }
        else{
            console.log('Updated','Updated')
        }
        process.exit(0)
    })

    console.log('res',res)
    
   
}

function verifyToken(res,req,next){
    console.log(req.headers['authorization'])
    next();
    // const bearerHeader = req.headers['authorization'];
    // res.send({
    //     "message":req.headers
    // })
    // if(typeof bearerHeader !== "undefined"){
    //     const bearerToken = bearerHeader.split(' ')[1];
    //     req.token = bearerToken;
    //     next();
    // }
    // else{
    //     res.sendStatus(403);
    // }
}

async function comparePassword(hashedPassword,requestPassword){
    
    const validPassword = await bcrypt.compare(requestPassword, hashedPassword);
      if (validPassword) {
          console.log('Password is Correct');
        return true  
       
      } else {
            
        console.log('Password is Incorrect');
        return false;
      }

      

}

function middlewareVerify(req,res,next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader === "undefined" || bearerHeader === ""){
        res.sendStatus(403);
    }
    else{
        req.token = bearerHeader;
        next();
    }
}


export default router;